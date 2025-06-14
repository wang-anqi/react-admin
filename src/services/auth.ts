import axios from 'axios';
import type { LoginParams, LoginResponse, RegisterParams, ChangePasswordParams, UserInfo } from '../types/user';

const API_URL = 'http://localhost:5000/api';  // 这里替换为你的实际API地址

// 创建axios实例
const authApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      // 清除token（仅在非登录页面时）
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);


export default authApi;

// 登录
// export const login = async (params: LoginParams): Promise<LoginResponse> => {
//   const response = await authApi.post<LoginResponse>('/auth/login', params);
//   return response.data;
// };

// 注册
// export const register = async (params: RegisterParams): Promise<void> => {
//   await authApi.post('/auth/register', params);
// };

// 登出
// export const logout = async (): Promise<void> => {
//   await authApi.post('/auth/logout');
//   localStorage.removeItem('token');
// };

// 获取当前用户信息
// export const getCurrentUser = async (): Promise<UserInfo> => {
//   const response = await authApi.get<UserInfo>('/auth/me');
//   return response.data;
// };

// 修改密码
// export const changePassword = async (params: ChangePasswordParams): Promise<void> => {
//   await authApi.post('/auth/change-password', params);
// };

// 发送重置密码邮件
// export const sendResetPasswordEmail = async (email: string): Promise<void> => {
//   await authApi.post('/auth/forgot-password', { email });
// };

// 重置密码
// export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
//   await authApi.post('/auth/reset-password', { token, newPassword });
// }; 