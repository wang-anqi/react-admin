// 用户接口定义
// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   password: string;
//   role: 'admin' | 'manager' | 'user';
//   status: 'active' | 'inactive';
//   createdAt: string;
//   updatedAt: string;
//   permissions: string[];
//   token?: string;
// }

export interface User {
  id: string; // e.g. "admin-001"
  username: string;
  email: string;
  password: string;
  role: string; // 引用 roles.name
  status: 'active' | 'inactive';
  createdAt: string;
  token?: string;

}
export interface Role {
  id: number;
  name: string; // e.g. 'admin', 'managerBoss'
  description: string;
  permissions: string[];
  permissionDes?: string;
}

// 数据库结构定义
export interface Database {
  userslist: User[];
  roles: Role[];
}

export interface UsersList {
  id: string;
  username: string;
  email?: string;
  role: string
}

// types/index.ts - 类型定义扩展（添加到现有类型定义中）

// 现有类型...（保持原有的 User, Role, Database 等类型定义）

// 仪表盘相关类型
export interface DashboardData {
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

// 图表相关类型
export interface ChartData {
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

// 图表查询参数类型
export interface ChartQueryParams {
  region?: string;
  userType?: string;
  dateRange?: [string, string] | null;
}

// 仪表盘查询参数类型
export interface DashboardQueryParams {
  range?: '1d' | '7d' | '30d' | '90d';
}

// 图表汇总数据类型
export interface ChartSummaryData {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  averageUsersPerRole: number;
  mostPopularRole: string;
  recentUserCount: number;
}


// 管理员接口定义
// export interface Admin {
//   id: string;

//   username: string;
//   permissions: string[];
//   role: 'admin';
//   email:string;
//   password: string;
//   createdAt: string;
//   token?: string;
// }


// 登录请求体
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<User, 'password'>;
}

// 用户创建请求体
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  // role?: 'admin' | 'manager' | 'user';
  role: string;
  status?: 'active' | 'inactive';
}

// 用户更新请求体
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  // role?: 'admin' | 'manager' | 'user';
  role: string;
  status?: 'active' | 'inactive';
}

// API 响应通用格式
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// JWT 载荷
export interface JWTPayload {
  id: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}