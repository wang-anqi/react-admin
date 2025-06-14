import { LoginRequest, LoginResponse, User } from './types/user';
import { mockUsers } from './userData';

// 生成简单的 mock token
const generateMockToken = (user: User): string => {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24小时过期
  };
  return btoa(JSON.stringify(payload));
};

// Mock 登录服务
export const mockAuthService = {
  // 登录
  login: async (loginData: LoginRequest): Promise<LoginResponse> => {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        const user = mockUsers.find(
          u => u.username === loginData.username && u.password === loginData.password
        );

        if (user) {
          const { password, ...userWithoutPassword } = user;
          const token = generateMockToken(user);
          
          // 存储到 localStorage（模拟持久化）
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          
          resolve({
            success: true,
            message: '登录成功',
            data: {
              user: userWithoutPassword,
              token
            }
          });
        } else {
          resolve({
            success: false,
            message: '用户名或密码错误'
          });
        }
      }, 1000); // 模拟1秒延迟
    });
  },

  // 登出
  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        resolve();
      }, 500);
    });
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            resolve(user);
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  // 验证 token
  verifyToken: async (token: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const payload = JSON.parse(atob(token));
          const now = Date.now();
          resolve(payload.exp > now);
        } catch {
          resolve(false);
        }
      }, 200);
    });
  }
};