import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../services/auth';

// 定义用户信息类型
export interface UserInfo {
  id: number;
  token:string;
  username: string;
  // role: 'admin' | 'manager' | 'user';
  role:string;
  permissions: string[];
}



// 异步获取用户信息
export const fetchUserInfo = createAsyncThunk<UserInfo>(
  'user/fetchUserInfo',
  async () => {
    const res = await axiosInstance.get<UserInfo>('/auth/me');

    return res.data
  }
);

// 定义状态类型
export interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  token: null,
  userInfo: null,
  loading: false,
  error: null,
};

// 创建 Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearUser(state) {
      state.token = null;
      state.userInfo = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserInfo.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action: PayloadAction<UserInfo>) => {
        state.userInfo = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.userInfo = null;
        state.error = action.error.message || '获取失败';
      });
  },
});

// 导出
export const { setToken, clearUser } = userSlice.actions;
export default userSlice.reducer;
