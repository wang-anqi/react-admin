import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();

// 应用认证中间件
router.use(authenticateToken);

// 图表数据类型定义
interface ChartData {
  userTrend: Array<{
    date: string;
    users: number;
    activeUsers: number;
  }>;
  roleDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  regionStats: Array<{
    region: string;
    users: number;
    growth: number;
  }>;
  userTypeAnalysis: Array<{
    type: string;
    count: number;
    percentage: number;
    trend: number;
  }>;
  activityMetrics: {
    dailyActive: Array<{
      date: string;
      count: number;
    }>;
    weeklyGrowth: Array<{
      week: string;
      newUsers: number;
      activeUsers: number;
    }>;
  };
}

/**
 * GET /api/charts
 * 获取图表数据
 */
router.get('/', async (req: Request, res: Response<ApiResponse<ChartData>>) => {
  try {
    const { region, userType, dateRange } = req.query;
    
    await db.read();

    const users = db.data!.userslist;
    const roles = db.data!.roles;

    // 过滤用户数据（根据查询参数）
    let filteredUsers = users;

    // 根据用户类型过滤
    if (userType && userType !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === userType);
    }

    // 根据日期范围过滤
    if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filteredUsers = filteredUsers.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate >= new Date(startDate as string) && userDate <= new Date(endDate as string);
      });
    }

    // 生成用户趋势数据（最近30天）
    const userTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      // 模拟用户增长趋势
      const baseUsers = Math.floor(i * 0.8) + Math.floor(Math.random() * 5);
      const activeUsers = Math.floor(baseUsers * 0.8) + Math.floor(Math.random() * 3);
      
      return {
        date: dateStr,
        users: baseUsers,
        activeUsers
      };
    });

    // 角色分布数据
    const roleColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];
    const roleDistribution = roles.map((role, index) => {
      const count = filteredUsers.filter(user => user.role === role.name).length;
      return {
        name: role.description || role.name,
        value: count,
        color: roleColors[index % roleColors.length]
      };
    }).filter(item => item.value > 0);

    // 地区统计数据（模拟数据）
    const regions = ['北京', '上海', '广州', '深圳', '杭州', '成都'];
    const regionStats = regions.map(regionName => {
      // 根据region参数过滤，如果没有指定则显示所有地区
      if (region && region !== 'all' && regionName !== region) {
        return null;
      }
      
      const users = Math.floor(Math.random() * 50) + 10;
      const growth = Math.floor(Math.random() * 20) - 5; // -5% 到 15% 的增长率
      
      return {
        region: regionName,
        users,
        growth
      };
    }).filter(Boolean) as Array<{
      region: string;
      users: number;
      growth: number;
    }>;

    // 用户类型分析
    const totalFilteredUsers = filteredUsers.length;
    const userTypeAnalysis = roles.map(role => {
      const count = filteredUsers.filter(user => user.role === role.name).length;
      const percentage = totalFilteredUsers > 0 ? Math.round((count / totalFilteredUsers) * 100) : 0;
      const trend = Math.floor(Math.random() * 30) - 10; // -10% 到 20% 的趋势变化
      
      return {
        type: role.description || role.name,
        count,
        percentage,
        trend
      };
    }).filter(item => item.count > 0);

    // 活动指标数据
    const activityMetrics = {
      // 每日活跃用户（最近7天）
      dailyActive: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const count = Math.floor(Math.random() * 20) + 10;
        
        return {
          date: dateStr,
          count
        };
      }),
      
      // 周增长数据（最近4周）
      weeklyGrowth: Array.from({ length: 4 }, (_, i) => {
        const weekNum = 4 - i;
        const newUsers = Math.floor(Math.random() * 15) + 5;
        const activeUsers = Math.floor(Math.random() * 25) + 15;
        
        return {
          week: `第${weekNum}周`,
          newUsers,
          activeUsers
        };
      }).reverse()
    };

    const chartData: ChartData = {
      userTrend,
      roleDistribution,
      regionStats,
      userTypeAnalysis,
      activityMetrics
    };

    res.json({
      success: true,
      message: '获取图表数据成功',
      data: chartData
    });

  } catch (error) {
    console.error('获取图表数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * GET /api/charts/summary
 * 获取图表汇总数据
 */
router.get('/summary', async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    await db.read();

    const users = db.data!.userslist;
    const roles = db.data!.roles;

    // 快速统计数据
    const summary = {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.status === 'active').length,
      totalRoles: roles.length,
      averageUsersPerRole: Math.round(users.length / roles.length),
      mostPopularRole: roles.reduce((prev, current) => {
        const prevCount = users.filter(user => user.role === prev.name).length;
        const currentCount = users.filter(user => user.role === current.name).length;
        return currentCount > prevCount ? current : prev;
      }).name,
      recentUserCount: users.filter(user => {
        const userDate = new Date(user.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return userDate >= weekAgo;
      }).length
    };

    res.json({
      success: true,
      message: '获取图表汇总数据成功',
      data: summary
    });

  } catch (error) {
    console.error('获取图表汇总数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;