import React from 'react';
import { useSelector } from 'react-redux';
import type { UserInfo } from '../types/user';
import type { RootState } from '../store';

// 检查用户是否有特定权限
export const hasPermission = (user: UserInfo | null, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

// 检查用户是否有特定角色
export const hasRole = (user: UserInfo | null, role: string): boolean => {
  if (!user) return false;
  return user.role === role;
};

// 权限控制组件的Props类型
export interface AuthorizedProps {
  permission?: string;
  role?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// 权限控制组件
export const Authorized: React.FC<AuthorizedProps> = ({
  permission,
  role,
  children,
  fallback = null,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (permission && !hasPermission(user, permission)) {
    return fallback;
  }

  if (role && !hasRole(user, role)) {
    return fallback;
  }

  return children;
}; 