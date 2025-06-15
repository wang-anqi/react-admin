// src/components/HasPermission.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface Props {
  code: string;                 // 权限点，如 'user:add'
  children: React.ReactNode;   // 被包裹的按钮或元素
}

/**
 * 权限判断组件
 * 1. 如果当前用户是 admin，直接通过
 * 2. 如果当前权限数组中包含指定权限码，也通过
 * 3. 否则不渲染任何内容
 */
const HasPermission: React.FC<Props> = ({ code, children }) => {
  const user = useSelector((state: RootState) => state.user.userInfo);

  if (!user) return null;

  // 管理员放行所有权限
  if (user.role === 'admin') return <>{children}</>;

  // 权限列表包含目标权限码
  const hasPerm = user.permissions?.includes(code);
  if (!hasPerm) return null;

  return <>{children}</>;
};

export default HasPermission;
