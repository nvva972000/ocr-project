export interface UserType {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  roles?: RoleType[];
  total?: number;
}

export interface RoleType {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  description?: string;
  user_count?: number;
}

export interface OrgType {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

export interface ActivityLogType {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  status: string;
  ip_address?: string;
  created_at: string;
}
