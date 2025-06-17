export interface User {
    id: string;
    username: string;
    password: string;
    name: string;
    role: 'admin' | 'manager' | 'user';
    avatar?: string;
    email?: string;
    permissions: string[];
  }
  
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
      user: Omit<User, 'password'>;
      token: string;
    };
  }