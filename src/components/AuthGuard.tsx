// AuthGuard.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
}) => {
  const location = useLocation();
  const { userInfo, token } = useSelector((state: RootState) => state.user);

  // ✅ 未登录则跳转 /login
  if (!token || !userInfo) {
    console.log('!token || !userInfo');
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ 检查角色权限
  const hasRole = requiredRoles.length === 0 || requiredRoles.includes(userInfo.data.role);

  // ✅ 检查操作权限（如果后续你扩展了权限点控制）
  const hasPermissions =
    requiredPermissions.length === 0 ||
    requiredPermissions.every(p => userInfo.data.permissions?.includes(p));

  if (!hasRole || !hasPermissions) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
