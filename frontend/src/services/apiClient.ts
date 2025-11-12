import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, AUTH_MODE, DOMAIN } from './config';
import { refreshToken, validateToken } from './auth.service';
import type { InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
type RetryAxiosRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 10000,
      withCredentials: true,
    });

    this.client.interceptors.request.use(
      (config) => {
        config.headers = config.headers || {};

        if (!config.headers['Content-Type']) {
          config.headers['Content-Type'] = 'application/json';
        }
        config.headers['Accept'] = 'application/json';

        const username = localStorage.getItem('username');
        if (username) {
          config.headers['actor'] = username;
        }

        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.status >= 200 && response.status < 300 && !('success' in response.data)) {
          return {
            ...response,
            data: {
              success: true,
              data: response.data,
            },
          };
        }
        return response;
      },
      async (error: AxiosError) => {
        if (!error.response) {
          return Promise.reject({
            success: false,
            error: 'Network error. Please check your connection.',
          } as APIResponse);
        }

        if (error.response.status === 0) {
          return Promise.reject({
            success: false,
            error: 'CORS error. Please check server configuration.',
          } as APIResponse);
        }

        const originalRequest = error.config as RetryAxiosRequestConfig | undefined;

        if (!originalRequest) {
          return Promise.reject({
            success: false,
            error: 'No original request found.',
          } as APIResponse);
        }

        // JWT token handling
        const authMode = AUTH_MODE;
        if (authMode) {
          const handleIfNoAuthenticated = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('username');
            localStorage.removeItem('email');
            window.location.href = `${DOMAIN}/login`;
          };

          const handleRefreshToken = async (refreshTokenValue: string) => {
            const refreshResponse = await refreshToken(refreshTokenValue);
            if (refreshResponse && refreshResponse.data) {
              localStorage.setItem('token', refreshResponse.data.access_token);
              localStorage.setItem('refresh_token', refreshResponse.data.refresh_token);
              return refreshResponse.data.access_token;
            } else {
              handleIfNoAuthenticated();
            }
          };

          if (error.response.status === 403) {
            // 403 = Forbidden (user is authenticated but no permission)
            return Promise.reject({
              success: false,
              error: 'Access denied. You do not have permission to perform this action.',
            } as APIResponse);
          }

          if (error.response.status === 401) {
            const accessToken = localStorage.getItem('token');
            const refreshTokenValue = localStorage.getItem('refresh_token');

            if (!accessToken || !refreshTokenValue) {
              handleIfNoAuthenticated();
              return;
            }

            let newToken = '';
            const result = await validateToken(accessToken);
            if (result?.data?.detail === "TOKEN_INVALID") {
              try {
                newToken = await handleRefreshToken(refreshTokenValue);
                if (!newToken) {
                  handleIfNoAuthenticated();
                  return;
                }
              } catch (err) {
                handleIfNoAuthenticated();
                return;
              }
            } else if (result?.data?.detail === "TOKEN_VALID") {
              newToken = accessToken;
            } else {
              handleIfNoAuthenticated();
              return;
            }
            
            originalRequest._retry = true;
            (originalRequest.headers as any)["Authorization"] = `Bearer ${newToken}`;
            return this.client.request(originalRequest as AxiosRequestConfig);
          }
        }

        const errorResponse = error.response?.data as { error?: string };
        const message = errorResponse?.error || error.message;
        return Promise.reject({
          success: false,
          error: message,
        } as APIResponse);
      }
    );
  }

  async get<T = any>(url: string, params?: any, headers?: any): Promise<APIResponse<T>> {
    try {
      const response = await this.client.get<APIResponse<T>>(url, {
        params,
        headers,
      });
      return response.data;
    } catch (error) {
      return error as APIResponse;
    }
  }

  async post<T = any>(url: string, data?: any, params?: any): Promise<APIResponse<T>> {
    try {
      const response = await this.client.post<APIResponse<T>>(url, data, { params });
      return response.data;
    } catch (error) {
      return error as APIResponse;
    }
  }

  async put<T = any>(url: string, data?: any): Promise<APIResponse<T>> {
    try {
      const response = await this.client.put<APIResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      return error as APIResponse;
    }
  }

  async delete<T = any>(url: string, data?: any): Promise<APIResponse<T>> {
    try {
      const response = await this.client.delete<APIResponse<T>>(url, { data });
      return response.data;
    } catch (error) {
      return error as APIResponse;
    }
  }
}

export const apiV1Client = new ApiClient();

export default ApiClient;
