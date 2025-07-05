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

// 角色树类型
export interface RoleTreeItem {
  title: string;
  key: string;
  children?: RoleTreeItem[];
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

// 创建角色的异步 action
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

// 异步请求角色树
export const fetchRoleTree = createAsyncThunk(
  'roles/fetchRoleTree',
  async (_, { rejectWithValue }) => {
    try {
      console.log('正在获取角色树数据...');
      const res = await axiosInstance.get('/roles/rolesTree');
      console.log('API 返回的原始角色树数据:', res.data);

      // 处理不同的API响应格式
      let treeData;
      if (res.data && typeof res.data === 'object') {
        // 如果返回格式是 {code: 200, data: [...]}
        if ('data' in res.data && res.data.code === 200) {
          treeData = res.data.data;
        }
        // 如果直接返回树结构
        else if (Array.isArray(res.data)) {
          treeData = res.data;
        }
        // 处理其他格式
        else if ('data' in res.data) {
          treeData = res.data.data;
        } else {
          treeData = res.data;
        }
      } else {
        // 如果返回的不是对象，直接使用
        treeData = res.data;
      }

      console.log('处理后的角色树数据:', treeData);
      return treeData;
    } catch (error: any) {
      console.error('获取角色树失败:', error);
      return rejectWithValue(error.message || '获取角色树失败');
    }
  }
);

export interface RolesState {
  roles: Role[];
  roleTree: RoleTreeItem[]; // 新增角色树状态
  loading: boolean;
  treeLoading: boolean; // 角色树加载状态
  error: string | null;
  treeError: string | null; // 角色树错误状态
  lastUpdated: number | null;
  roleTreeVersion: number;
}

const initialState: RolesState = {
  roles: [],
  roleTree: [],
  loading: false,
  treeLoading: false,
  error: null,
  treeError: null,
  lastUpdated: null,
  roleTreeVersion: 0,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    // 清除错误状态
    clearError: (state) => {
      state.error = null;
      state.treeError = null;
    },
    // 重置角色状态
    resetRoles: (state) => {
      state.roles = [];
      state.roleTree = [];
      state.error = null;
      state.treeError = null;
      state.lastUpdated = null;
    },
    incrementRoleTreeVersion(state) {
      console.log('roleTreeVersion 旧值:', state.roleTreeVersion);
      state.roleTreeVersion += 1;
      console.log('roleTreeVersion 新值:', state.roleTreeVersion);
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

        // 角色列表更新时增加角色树版本号
        state.roleTreeVersion += 1;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        console.error('获取角色失败:', action.payload);
        state.error = action.payload as string;
        state.loading = false;
      })

      // 获取角色树
      .addCase(fetchRoleTree.pending, (state) => {
        state.treeLoading = true;
        state.treeError = null;
      })
      .addCase(fetchRoleTree.fulfilled, (state, action) => {
        console.log('Redux 接收到角色树数据:', action.payload);
        state.roleTree = action.payload;
        state.treeLoading = false;
        state.treeError = null;
      })
      .addCase(fetchRoleTree.rejected, (state, action) => {
        console.error('获取角色树失败:', action.payload);
        state.treeError = action.payload as string;
        state.treeLoading = false;
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

export const { clearError, resetRoles, incrementRoleTreeVersion } = rolesSlice.actions;
export default rolesSlice.reducer;

// Selectors
export const selectRoles = (state: RootState) => {
  const roles = state.roles.roles;
  console.log('Selector 中的 roles:', roles, '数量:', roles.length);
  return roles;
};

export const selectRoleTree = (state: RootState) => state.roles.roleTree;
export const selectRoleTreeLoading = (state: RootState) => state.roles.treeLoading;
export const selectRoleTreeError = (state: RootState) => state.roles.treeError;
export const selectRoleLoading = (state: RootState) => state.roles.loading;
export const selectRoleError = (state: RootState) => state.roles.error;
export const selectLastUpdated = (state: RootState) => state.roles.lastUpdated;
export const selectRoleTreeVersion = (state: RootState) => state.roles.roleTreeVersion;

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