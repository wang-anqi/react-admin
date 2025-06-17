import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../database/db.js';
import { comparePassword, generateToken, verifyToken } from '../utils/auth.js';
import type { LoginRequest, LoginResponse, ApiResponse } from '../types/index.js';


const router = Router();

// 用户类型定义
// interface User {
//   id: number;
//   username: string;
//   password: string;
//   role: string;
//   permissions: string[];
// }

// const users: User[] = [
//   {
//     id: 1,
//     username: 'admin',
//     password: 'admin',
//     role: 'admin',
//     permissions: ['user:add', 'user:edit', 'user:delete'],
//   },
//   {
//     id: 2,
//     username: 'manager',
//     password: 'manager',
//     role: 'manager',
//     permissions: ['user:add'],
//   },
//   {
//     id: 3,
//     username: 'user',
//     password: 'user',
//     role: 'user',
//     permissions: [],
//   },
// ];

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


    function getPermissionsByRole(roleName: string) {
      const roles = db.data.roles.flat?.() || [];
      const role = roles.find((r: any) => r.name === roleName);
      return role?.permissions ?? [];
    }

    // 找到用户
    const user = db.data.userslist.find((u: any) => u.username === username);

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
        // 根据角色找permission
        const permissions = getPermissionsByRole(user.role);
        

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
            status: 'active',
            createdAt: user.createdAt,
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


    
    function getPermissionsByRole(roleName: string) {
      const roles = db.data.roles.flat?.() || [];
      const role = roles.find((r: any) => r.name === roleName);
      return role?.permissions ?? [];
    }

    const user = db.data?.userslist.find(u => u.id === payload.id) 

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const permissions = getPermissionsByRole(user.role);
    return res.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        id: user.id,
        username: user.username,
        role: user.role ?? 'user',
        permissions,

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