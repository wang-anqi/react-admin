import {User} from './types/user'
// Mock 用户数据
export const mockUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      name: '超级管理员',
      role: 'admin',
      email: 'admin@example.com',
      avatar: 'https://via.placeholder.com/64',
      permissions: [
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
        'system:config',
        'dashboard:view',
        'reports:view',
        'reports:export'
      ]
    },
    {
      id: '2',
      username: 'manager',
      password: 'manager123',
      name: '部门管理员',
      role: 'manager',
      email: 'manager@example.com',
      avatar: 'https://via.placeholder.com/64',
      permissions: [
        'user:read',
        'user:update',
        'dashboard:view',
        'reports:view'
      ]
    },
    {
      id: '3',
      username: 'user',
      password: 'user123',
      name: '普通员工',
      role: 'user',
      email: 'user@example.com',
      avatar: 'https://via.placeholder.com/64',
      permissions: [
        'dashboard:view'
      ]
    }
  ];