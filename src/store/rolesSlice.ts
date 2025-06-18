import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../services/auth'; // 自定义 axiosInstance 实例
import { RootState } from './index';

// 角色类型
export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

// 异步请求角色列表
export const fetchRoles = createAsyncThunk('roles/fetchRoles', async () => {
  const res = await axiosInstance.get('/roles');
  console.log('API 返回的原始数据:', res.data);
  
  // 后端返回格式：{code: 200, data: Array(4)} 或直接返回 Array
  // 先检查是否有 data 字段，如果有就使用 data，否则直接使用 res.data
  let rolesData;
  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    // 如果返回格式是 {code: 200, data: [...]}
    rolesData = res.data.data;
  } else {
    // 如果直接返回数组
    rolesData = res.data;
  }
  // 多层扁平化处理，确保得到最终的角色数组
  let finalRolesData = rolesData;
  
  // 如果是嵌套数组，递归扁平化直到得到对象数组
  while (Array.isArray(finalRolesData) && Array.isArray(finalRolesData[0])) {
    finalRolesData = finalRolesData.flat();
  }
  
  console.log('处理后的角色数据:', finalRolesData);
  console.log('第一个角色对象:', finalRolesData[0]);
  
  return finalRolesData;

});

export interface RolesState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        console.log('Redux 接收到的数据:', action.payload);
        state.roles = action.payload;
        state.loading = false;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        console.error('获取角色失败:', action.error);
        state.error = action.error.message || '获取角色失败';
        state.loading = false;
      });
  },
});

export default rolesSlice.reducer;

// selector
export const selectRoles = (state: RootState) => {
  console.log('Selector 中的 roles:', state.roles.roles);
  return state.roles.roles;
};
export const selectRoleLoading = (state: RootState) => state.roles.loading;
export const selectRoleError = (state: RootState) => state.roles.error;