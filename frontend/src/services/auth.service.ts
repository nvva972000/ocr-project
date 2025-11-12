import axios from 'axios';
import { API_BASE_URL } from './config';

// Create isolated auth client to avoid circular dependency
const authClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  withCredentials: true,
});

export async function validateToken(token: string) {
  try {
    const res = await authClient.get(`/authentication/validate/token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  } catch (error: any) {
    return {
      data: {
        detail: "TOKEN_INVALID"
      },
      status: 401
    };
  }
}

export async function refreshToken(refresh_token: string) {
  try {
    const res = await authClient.post(`/authentication/refresh/token`, {
      refresh_token,
    });
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function login(username: string, password: string) {
  try {
    const res = await authClient.post(`/login`, {
      username,
      password,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Login failed' };
  }
}

export async function register(userData: {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}) {
  try {
    const res = await authClient.post(`/register`, userData);
    return res.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'Registration failed' };
  }
}
