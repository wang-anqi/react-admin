import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../database/db.js';
import { comparePassword, generateToken ,verifyToken} from '../utils/auth.js';
import type { LoginRequest, LoginResponse, ApiResponse } from '../types/index.js';
import { message } from 'antd';

const router = Router();

// 用户类型定义
interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  permissions: string[];
}

const users: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    role: 'admin',
    permissions: ['user:add', 'user:edit', 'user:delete'],
  },
  {
    id: 2,
    username: 'manager',
    password: 'manager',
    role: 'manage',
    permissions: ['user:add'],
  },
  {
    id: 3,
    username: 'user',
    password: 'user',
    role: 'user',
    permissions: [],
  },
];

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req: Request<{}, LoginResponse, LoginRequest>, res: Response<LoginResponse>) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
      return;
    }

    await db.read();

    // 先检查管理员
    const admin = db.data!.admins.find(admin => admin.username === username);
    if (admin) {
      const isValidPassword = await comparePassword(password, admin.password);
      if (isValidPassword) {
        const token = generateToken({
          id: admin.id,
          username: admin.username,
          role: 'admin'
        });
        // 返回的结果
        res.json({
          success: true,
          message: '登录成功',
          token,
          user: {
            id: admin.id,
            username: admin.username,
            role: 'admin' as const
          }
        });
        return;
      }
    }

    // 检查普通用户
    const user = db.data!.users.find(user => user.username === username);
    if (user) {
      const isValidPassword = await comparePassword(password, user.password);
      if (isValidPassword) {
        if (user.status === 'inactive') {
          res.status(403).json({
            success: false,
            message: '账户已被禁用'
          });
          return;
        }

        const token = generateToken({
          id: user.id,
          username: user.username,
          role: user.role
        });
        user.token = token; // 保存到 db
        await db.write();

        res.json({
          success: true,
          message: '登录成功',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
        return;
      }
    }

    // 用户名或密码错误
    res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * POST /api/auth/logout
 * 用户登出 (这里只是一个示例，实际的登出逻辑通常在前端处理)
 */
router.post('/logout', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: '登出成功'
  });
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
// router.get('/me', async (req: Request, res: Response) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ message: '未提供 token' });
//     }

//     await db.read();

//     const user = db.data?.users.find(u => u.token === token) ||
//                  db.data?.admins.find(a => a.token === token);

//     if (!user) {
//       return res.status(401).json({ message: '无效 token 或用户不存在' });
//     }

//     res.json({
//       id: user.id,
//       username: user.username,
//       role: user.role,
//       permissions: user.permissions,
//       createdAt: user.createdAt
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: '服务器内部错误'
//     });
//   }
// });
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.split(' ')[1];

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: '无效 token'
      });
    }

    await db.read();

    const user = db.data?.users.find(u => u.id === payload.id) ||
                 db.data?.admins.find(a => a.id === payload.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    return res.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        id: user.id,
        username: user.username,
        role: user.role ?? 'user',
        permissions: user.permissions ?? [],
       
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;