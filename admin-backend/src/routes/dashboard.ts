import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();

// 应用认证中间件
router.use(authenticateToken);

// 仪表盘数据类型定义
interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  userGrowth: number;
  usersByRole: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'user_created' | 'user_updated' | 'role_assigned';
    description: string;
    timestamp: string;
    user: string;
  }>;
  systemStats: {
    systemUptime: string;
    lastBackup: string;
    activeConnections: number;
  };
}

/**
 * GET /api/dashboard
 * 获取仪表盘数据
 */
router.get('/', async (req: Request, res: Response<ApiResponse<DashboardData>>) => {
  try {
    const { range = '7d' } = req.query;
    
    await db.read();

    const users = db.data!.userslist;
    const roles = db.data!.roles;

    // 计算总用户数
    const totalUsers = users.length;
    
    // 计算活跃用户数（状态为 active 的用户）
    const activeUsers = users.filter(user => user.status === 'active').length;
    
    // 计算总角色数
    const totalRoles = roles.length;

    // 计算用户增长率（模拟数据，基于时间范围）
    const getUserGrowth = (timeRange: string): number => {
      const growthRates: { [key: string]: number } = {
        '1d': 2.5,
        '7d': 8.3,
        '30d': 15.7,
        '90d': 32.1
      };
      return growthRates[timeRange as string] || 8.3;
    };

    const userGrowth = getUserGrowth(range as string);

    // 按角色统计用户分布
    const usersByRole = roles.map(role => {
      const count = users.filter(user => user.role === role.name).length;
      const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
      return {
        role: role.name,
        count,
        percentage
      };
    }).filter(item => item.count > 0); // 只返回有用户的角色

    // 生成最近活动记录（基于现有用户数据模拟）
    const recentActivity = users.slice(-5).map((user, index) => ({
      id: `activity-${Date.now()}-${index}`,
      type: 'user_created' as const,
      description: `用户 ${user.username} 已创建`,
      timestamp: user.createdAt,
      user: user.username
    })).reverse();

    // 系统统计信息（模拟数据）
    const systemStats = {
      systemUptime: '15天 6小时 23分钟',
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 昨天
      activeConnections: Math.floor(Math.random() * 50) + 10 // 10-60之间的随机数
    };

    const dashboardData: DashboardData = {
      totalUsers,
      activeUsers,
      totalRoles,
      userGrowth,
      usersByRole,
      recentActivity,
      systemStats
    };

    res.json({
      success: true,
      message: '获取仪表盘数据成功',
      data: dashboardData
    });

  } catch (error) {
    console.error('获取仪表盘数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;