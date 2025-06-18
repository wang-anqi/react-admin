// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../services/auth'; // 自定义 axiosInstance 实例
// import { RootState } from './index';

// // 角色类型
// export interface Role {
//   id: number;
//   name: string;
//   description: string;
//   permissions: string[];
// }

// // 异步请求角色列表
// export const fetchRoles = createAsyncThunk('roles/fetchRoles', async () => {
//   const res = await axiosInstance.get('/roles');
//   console.log('API 返回的原始数据:', res.data);
  
//   // 后端返回格式：{code: 200, data: Array(4)} 或直接返回 Array
//   // 先检查是否有 data 字段，如果有就使用 data，否则直接使用 res.data
//   let rolesData;
//   if (res.data && typeof res.data === 'object' && 'data' in res.data) {
//     // 如果返回格式是 {code: 200, data: [...]}
//     rolesData = res.data.data;
//   } else {
//     // 如果直接返回数组
//     rolesData = res.data;
//   }
//   // 多层扁平化处理，确保得到最终的角色数组
//   let finalRolesData = rolesData;
  
//   // 如果是嵌套数组，递归扁平化直到得到对象数组
//   while (Array.isArray(finalRolesData) && Array.isArray(finalRolesData[0])) {
//     finalRolesData = finalRolesData.flat();
//   }
  
//   console.log('处理后的角色数据:', finalRolesData);
//   console.log('第一个角色对象:', finalRolesData[0]);
  
//   return finalRolesData;

// });

// export interface RolesState {
//   roles: Role[];
//   loading: boolean;
//   error: string | null;
// }

// const initialState: RolesState = {
//   roles: [],
//   loading: false,
//   error: null,
// };

// const rolesSlice = createSlice({
//   name: 'roles',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchRoles.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchRoles.fulfilled, (state, action) => {
//         console.log('Redux 接收到的数据:', action.payload);
//         state.roles = action.payload;
//         state.loading = false;
//       })
//       .addCase(fetchRoles.rejected, (state, action) => {
//         console.error('获取角色失败:', action.error);
//         state.error = action.error.message || '获取角色失败';
//         state.loading = false;
//       });
//   },
// });

// export default rolesSlice.reducer;

// // selector
// export const selectRoles = (state: RootState) => {
//   console.log('Selector 中的 roles:', state.roles.roles);
//   return state.roles.roles;
// };
// export const selectRoleLoading = (state: RootState) => state.roles.loading;
// export const selectRoleError = (state: RootState) => state.roles.error;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../services/auth';
import { RootState } from './index';

// 角色类型 - 包含完整的角色信息
export interface Role {
  id: number;
  name: string;
  description: string;
  permissionDes?: string;
  permissions: string[];
}

// 异步请求角色列表
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles', 
  async (_, { rejectWithValue }) => {
    try {
      console.log('正在获取角色数据...');
      const res = await axiosInstance.get('/roles');
      console.log('API 返回的原始数据:', res.data);
      
      // 后端返回格式：{code: 200, data: Array} 
      let rolesData;
      if (res.data && typeof res.data === 'object' && 'data' in res.data) {
        // 如果返回格式是 {code: 200, data: [...]}
        if (res.data.code === 200) {
          rolesData = res.data.data;
        } else {
          throw new Error(res.data.message || '获取角色数据失败');
        }
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
      
      // 数据清洗和标准化
      const cleanedRoles = finalRolesData.map((role: any) => ({
        id: role.id,
        name: role.name || '',
        description: role.description || '',
        permissionDes: role.permissionDes || '',
        permissions: Array.isArray(role.permissions) ? role.permissions : []
      }));
      
      console.log('处理后的角色数据:', cleanedRoles);
      console.log('角色数量:', cleanedRoles.length);
      
      return cleanedRoles;
    } catch (error: any) {
      console.error('获取角色数据失败:', error);
      return rejectWithValue(error.message || '获取角色数据失败');
    }
  }
);

// 创建角色的异步 action（可选，用于更精细的状态管理）
export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData: Omit<Role, 'id'>, { dispatch, rejectWithValue }) => {
    try {
      console.log('正在创建角色:', roleData);
      const res = await axiosInstance.post('/roles', roleData);
      
      if (res.data.code === 200) {
        console.log('角色创建成功:', res.data.data);
        // 创建成功后重新获取所有角色数据，确保同步
        await dispatch(fetchRoles());
        return res.data.data;
      } else {
        throw new Error(res.data.message || '创建角色失败');
      }
    } catch (error: any) {
      console.error('创建角色失败:', error);
      return rejectWithValue(error.response?.data?.message || '创建角色失败');
    }
  }
);

// 更新角色的异步 action
export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ id, ...roleData }: Partial<Role> & { id: number }, { dispatch, rejectWithValue }) => {
    try {
      console.log('正在更新角色:', id, roleData);
      const res = await axiosInstance.put(`/roles/${id}`, roleData);
      
      if (res.data.code === 200) {
        console.log('角色更新成功:', res.data.data);
        // 更新成功后重新获取所有角色数据，确保同步
        await dispatch(fetchRoles());
        return res.data.data;
      } else {
        throw new Error(res.data.message || '更新角色失败');
      }
    } catch (error: any) {
      console.error('更新角色失败:', error);
      return rejectWithValue(error.response?.data?.message || '更新角色失败');
    }
  }
);

// 删除角色的异步 action
export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (roleId: number, { dispatch, rejectWithValue }) => {
    try {
      console.log('正在删除角色:', roleId);
      const res = await axiosInstance.delete(`/roles/${roleId}`);
      
      if (res.data.code === 200) {
        console.log('角色删除成功');
        // 删除成功后重新获取所有角色数据，确保同步
        await dispatch(fetchRoles());
        return roleId;
      } else {
        throw new Error(res.data.message || '删除角色失败');
      }
    } catch (error: any) {
      console.error('删除角色失败:', error);
      return rejectWithValue(error.response?.data?.message || '删除角色失败');
    }
  }
);

export interface RolesState {
  roles: Role[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null; // 添加最后更新时间戳
}

const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    // 清除错误状态
    clearError: (state) => {
      state.error = null;
    },
    // 重置角色状态
    resetRoles: (state) => {
      state.roles = [];
      state.error = null;
      state.lastUpdated = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取角色列表
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        console.log('Redux 接收到角色数据:', action.payload);
        state.roles = action.payload;
        state.loading = false;
        state.error = null;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        console.error('获取角色失败:', action.payload);
        state.error = action.payload as string;
        state.loading = false;
      })
      
      // 创建角色
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      
      // 更新角色
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      
      // 删除角色
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { clearError, resetRoles } = rolesSlice.actions;
export default rolesSlice.reducer;

// Selectors
export const selectRoles = (state: RootState) => {
  const roles = state.roles.roles;
  console.log('Selector 中的 roles:', roles, '数量:', roles.length);
  return roles;
};

export const selectRoleLoading = (state: RootState) => state.roles.loading;
export const selectRoleError = (state: RootState) => state.roles.error;
export const selectLastUpdated = (state: RootState) => state.roles.lastUpdated;

// 根据名称查找角色
export const selectRoleByName = (state: RootState, roleName: string) => {
  return state.roles.roles.find(role => role.name === roleName);
};

// 根据 ID 查找角色
export const selectRoleById = (state: RootState, roleId: number) => {
  return state.roles.roles.find(role => role.id === roleId);
};

// 获取所有角色名称（用于下拉选择等）
export const selectRoleNames = (state: RootState) => {
  return state.roles.roles.map(role => ({
    value: role.name,
    label: role.description || role.name,
    id: role.id
  }));
};