import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      message: 'Missing Authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  // 简单 token 校验
  if (
    token === 'mock-admin-token' ||
    token === 'mock-manage-token' ||
    token === 'mock-user-token'
  ) {
    // 可以扩展：把 role 挂到 req 对象上
    (req as any).user = {
      role:
        token === 'mock-admin-token'
          ? 'admin'
          : token === 'mock-manage-token'
          ? 'manage'
          : 'user',
    };
    next();
  } else {
    return res.status(401).json({
      code: 401,
      message: 'Invalid token',
    });
  }
};
