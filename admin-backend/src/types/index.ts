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
  token?:string;

}
export interface Role {
  id: number;
  name: string; // e.g. 'admin', 'managerBoss'
  description: string;
  permissionDes:string;
  permissions: string[];
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
  role:string;
  status?: 'active' | 'inactive';
}

// 用户更新请求体
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  // role?: 'admin' | 'manager' | 'user';
  role:string;
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