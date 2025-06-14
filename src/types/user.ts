// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// 登录参数类型
export interface LoginParams {
  username: string;
  password: string;
  remember?: boolean;
}

// 用户信息类型
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: string[];
  avatar: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: UserInfo;
}

// 注册请求参数
export interface RegisterParams {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
}

// 修改密码请求参数
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
} 