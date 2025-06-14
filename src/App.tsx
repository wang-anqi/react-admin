import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import Login from './pages/login';
import Forbidden from './pages/403';

import AuthGuard from './components/AuthGuard';
import UserList from './pages/user/userList';
import RoleManage from './pages/manage/roleManage';
import Dashboard from './pages/dashboard';

// 这里之后可以添加更多的页面组件
const UserManagement = () => <div>User Management</div>;

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <Routes>
            {/* 公共路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/403" element={<Forbidden />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />

            <Route
              path="/users"
              element={
                <AuthGuard requiredRoles={['admin', 'manage']}>
                  <UserList />
                </AuthGuard>
              }
            />

            <Route
              path="/roles"
              element={
                <AuthGuard requiredRoles={['admin']}>
                  <RoleManage />
                </AuthGuard>
              }
            />

            {/* 需要认证的路由 */}
            {/* <Route
              path="/"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            /> */}

            {/* 需要特定权限的路由 */}
            {/* <Route
              path="/users"
              element={
                <AuthGuard requiredPermissions={['user:manage']}>
                  <UserManagement />
                </AuthGuard>
              }
            /> */}

            {/* 404重定向 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;
