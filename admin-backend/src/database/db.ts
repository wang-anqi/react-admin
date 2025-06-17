import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import type { Database, User,  Role } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 数据库文件路径
const file = join(__dirname, '../../data/db.json');

// 配置 lowdb
const adapter = new JSONFile<Database>(file);
export const db = new Low<Database>(adapter, {
  userslist: [],
  roles: []
});

// 初始化数据库
export async function initDatabase(): Promise<void> {
  // 读取数据库
  await db.read();

  // 如果数据库为空，创建默认数据
  if (!db.data) {
    db.data = {

      userslist: [],
      roles: []
    };
  }


  // 创建默认管理员账户（如果不存在）
  if (db.data.roles.length === 0) {
    
    const defaultRole: Role = [
      {
        "id": 1,
        "name": "admin",
        "description": "系统管理员，拥有全部权限",
        "permissions": [
          "user:add",
          "user:edit",
          "user:delete",
          "role:add",
          "role:edit",
          "role:delete",
          "permission:assign"
        ]
      },
      {
        "id": 2,
        "name": "managerBoss",
        "description": "业务高级管理员，拥有部分用户列表管理权限",
        "permissions": [
          "user:add",
          "user:edit",
          "user:delete"
        ]
      },
      {
        "id": 3,
        "name": "manager",
        "description": "业务管理员，具有部分用户列表管理权限",
        "permissions": [
          "user:add"
        ]
      },
      {
        "id": 3,
        "name": "user",
        "description": "普通用户，仅具查看权限",
        "permissions": []
      }
    ]

    db.data.roles.push(defaultRole);
  }

  // 创建一些测试用户数据（如果不存在）
  if (db.data.userslist.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const testUsers: User[] = [
      {
        "id": "usersMember-001",
        "username": "manager",
        "email": "zhangsan@example.com",
        "password": hashedPassword,
        "role": "manager",
        "status": "active",
        "createdAt": "2025-06-17T06:43:11.653Z",
       
      },
      {
        "id": "usersMember-003",
        "username": "user",
        "email": "zhangsanwewad@example.com",
        "password": hashedPassword,
        "role": "user",
        "status": "active",
        "createdAt": "2025-06-17T06:43:11.759Z",
      },
      {
        "id": "admin-001",
        "username": "admin",
        "role": "admin",
        "email": "wangzhangsan@example.com",
        "password":hashedPassword,
        "status": "active",
        "createdAt": "2025-06-17T06:43:11.600Z"
      }
    ];

    db.data.userslist.push(...testUsers);
  }

  

  // 写入数据库
  await db.write();
  console.log('数据库初始化完成');
}

// 生成唯一 ID
export function generateId(prefix: string = 'user'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}