import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import type { Database, User, Admin } from '../types/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 数据库文件路径
const file = join(__dirname, '../../data/db.json');

// 配置 lowdb
const adapter = new JSONFile<Database>(file);
export const db = new Low<Database>(adapter, {
  users: [], 
  admins: []  
});

// 初始化数据库
export async function initDatabase(): Promise<void> {
  // 读取数据库
  await db.read();

  // 如果数据库为空，创建默认数据
  if (!db.data) {
    db.data = {
      users: [],
      admins: []
    };
  }

  // 创建默认管理员账户（如果不存在）
  if (db.data.admins.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const defaultAdmin: Admin = {
      id: 'admin-001',
      username: 'admin',
      role:'admin',
      email: 'wangzhangsan@example.com',
      password: hashedPassword,
      permissions: ['user:add', 'user:edit', 'user:delete'],
      createdAt: new Date().toISOString()
    };
    
    db.data.admins.push(defaultAdmin);
  }

  // 创建一些测试用户数据（如果不存在）
  if (db.data.users.length === 0) {
    const testUsers: User[] = [
      {
        id: 'usersMember-001',
        username: 'zhangsan',
        email: 'zhangsan@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'manage',
        status: 'active',
        permissions: ['user:add'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usersMember-002',
        username: 'lisi',
        email: 'lisi@example.com',
        password: await bcrypt.hash('123456', 10),
        permissions: ['user:add'],
        role: 'manage',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usersMember-003',
        username: 'zhangsanwewad',
        email: 'zhangsanwewad@example.com',
        password: await bcrypt.hash('123456', 10),
        role: 'user',
        status: 'active',
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usersMember-004',
        username: 'wanglisi',
        email: 'wanglisi@example.com',
        password: await bcrypt.hash('123456', 10),
        permissions: [],
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usersMember-004',
        username: 'user',
        email: 'user@example.com',
        password: await bcrypt.hash('123456', 10),
        permissions: [],
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usersMember-005',
        username: 'sfeflisi',
        email: 'sfeflisizhang@example.com',
        password: await bcrypt.hash('123456', 10),
        permissions:  [],
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usersMember-006',
        username: 'wang',
        email: 'anqi@example.com',
        password: await bcrypt.hash('123456', 10),
        permissions:  [ 'user:edit'],
        role: 'manage',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    db.data.users.push(...testUsers);
  }

  // if (db.data.usersList.length === 0) {
  
  //   const defaultAdmin: Admin = {
  //     id: 'admin-001',
  //     username: 'admin',
  //     role:'admin',
  //     password: hashedPassword,
  //     permissions: ['user:add', 'user:edit', 'user:delete'],
  //     createdAt: new Date().toISOString()
  //   };
    
  //   db.data.admins.push(defaultAdmin);
  // }

  // 写入数据库
  await db.write();
  console.log('数据库初始化完成');
}

// 生成唯一 ID
export function generateId(prefix: string = 'user'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}