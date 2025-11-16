import { httpClient } from './httpClient';
import type { APIResponse } from './httpClient';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  roles?: Array<{ id: string; name: string; code: string }>;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserRoleAssignment {
  user_id: string;
  role_ids: string[];
}

export const userApi = {
  
  getUsers: async (params?: {
    q?: string;
    page?: number;
    page_size?: number;
  }): Promise<APIResponse<UserListResponse>> => {
    return httpClient.get('/users', params);
  },

  // Sync users from API
  syncUsers: async (): Promise<APIResponse<{ status: string; message: string }>> => {
    return httpClient.post('/users/sync-users');
  },
};

