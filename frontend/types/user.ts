export type UserRole = 'ADMIN' | 'UTILITY_MANAGER' | 'GRID_ENGINEER' | 'FIELD_INSPECTOR' | 'AUDITOR';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}
