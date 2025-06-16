import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, generateId } from '../database/db.js';
import { hashPassword } from '../utils/auth.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import type { User, CreateUserRequest, UpdateUserRequest, ApiResponse } from '../types/index.js';

const router = Router();

// 应用认证中间件到所有用户路由
router.use(authenticateToken);

/**
 * GET /api/users/userslist
 * 获取用户列表数据
 */
router.get('/userslist', async (req: Request, res: Response<ApiResponse<User[]>>) => {
  try {
    await db.read();
    
    // 移除密码字段后返回用户列表
    const users = db.data!.users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      message: '获取用户列表成功',
      data: users as User[]
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * POST /api/users/adduser
 * 新增用户
 */
router.post('/adduser', requireAdmin, async (req: Request<{}, ApiResponse<User>, CreateUserRequest>, res: Response<ApiResponse<User>>) => {
  try {
    const { username, email, password, role = 'user', status = 'active' } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码不能为空'
      });
      return;
    }

    await db.read();

    // 检查用户名是否已存在
    const existingUser = db.data!.users.find(user => user.username === username);
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: '用户名已存在'
      });
      return;
    }

    // 检查邮箱是否已存在
    const existingEmail = db.data!.users.find(user => user.email === email);
    if (existingEmail) {
      res.status(409).json({
        success: false,
        message: '邮箱已存在'
      });
      return;
    }

    // 创建新用户
    const hashedPassword = await hashPassword(password);
    const newUser: User = {
      id: generateId('user'),
      permissions: role==='user'?['user:add']: ['user:add', 'user:edit', 'user:delete'],
      username,
      email,
      password: hashedPassword,
      role,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.data!.users.push(newUser);
    await db.write();

    // 返回用户信息时移除密码
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: '用户创建成功',
      data: userWithoutPassword as User
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * PUT /api/users/edituser/:id
 * 编辑用户
 */
router.put('/edituser/:id', requireAdmin, async (req: Request<{ id: string }, ApiResponse<User>, UpdateUserRequest>, res: Response<ApiResponse<User>>) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: '用户ID不能为空'
      });
      return;
    }

    await db.read();

    const userIndex = db.data!.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        message: '用户不存在'
      });
      return;
    }

    const existingUser = db.data!.users[userIndex];

    // 如果要更新用户名，检查是否与其他用户冲突
    if (updateData.username && updateData.username !== existingUser.username) {
      const usernameExists = db.data!.users.some(user => user.username === updateData.username && user.id !== id);
      if (usernameExists) {
        res.status(409).json({
          success: false,
          message: '用户名已存在'
        });
        return;
      }
    }

    // 如果要更新邮箱，检查是否与其他用户冲突
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = db.data!.users.some(user => user.email === updateData.email && user.id !== id);
      if (emailExists) {
        res.status(409).json({
          success: false,
          message: '邮箱已存在'
        });
        return;
      }
    }

    // 更新用户信息
    const updatedUser: User = {
      ...existingUser,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    db.data!.users[userIndex] = updatedUser;
    await db.write();

    // 返回用户信息时移除密码
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: '用户更新成功',
      data: userWithoutPassword as User
    });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * DELETE /api/users/deleteuser/:id
 * 删除用户
 */
router.delete('/deleteuser/:id', requireAdmin, async (req: Request<{ id: string }>, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: '用户ID不能为空'
      });
      return;
    }

    await db.read();

    const userIndex = db.data!.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      res.status(404).json({
        success: false,
        message: '用户不存在'
      });
      return;
    }

    // 删除用户
    const deletedUser = db.data!.users.splice(userIndex, 1)[0];
    await db.write();

    res.json({
      success: true,
      message: `用户 ${deletedUser.username} 删除成功`
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * GET /api/users/user/:id
 * 获取单个用户详情
 */
router.get('/user/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<User>>) => {
  try {
    const { id } = req.params;

    await db.read();

    const user = db.data!.users.find(user => user.id === id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在'
      });
      return;
    }

    // 移除密码字段后返回
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: '获取用户信息成功',
      data: userWithoutPassword as User
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;