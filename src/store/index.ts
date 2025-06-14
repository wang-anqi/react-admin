import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
// import   authReducer from './authSlice'



export const store = configureStore({
  reducer: {
    user: userReducer,
    // auth: authReducer,
    
  },
});

export type RootState = ReturnType<typeof store.getState>;

// getState() 的结果结构是：
// {
//   user: UserState;
//   ...
// }  
export type AppDispatch = typeof store.dispatch;
