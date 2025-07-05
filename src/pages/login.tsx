import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../store';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  message,
  Typography,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { setToken, fetchUserInfo } from '../store/userSlice'
import type { RootState } from '../store';
import type { LoginParams } from '../types/user';

import './login.css';
import axiosInstance from '../services/auth'

const { Title } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.user);
  const [form] = Form.useForm();

  const handleLogin = async (values: LoginParams) => {
    try {
      const res = await axiosInstance.post('/auth/login', values);
      const { token, user } = res.data;
      const { role } = user;

      if (token && role) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);

        message.success('登录成功');
        dispatch(setToken(token));

        const result = await dispatch(fetchUserInfo());
        if (fetchUserInfo.fulfilled.match(result)) {
          navigate('/', { replace: true });
        }
      } else {
        message.error('登录失败：响应数据不完整');
      }
    } catch (error) {
      message.error('登录失败：' + (error as Error).message);
    }
  };

  useEffect(() => {
    console.log('Login 页面加载');
  }, []);

  return (
    <div className="login-container">
      <div className="login-content">
        <Card className="login-card">
          <Title level={2} className="login-title">
            后台管理系统
          </Title>
         
          <Form
            form={form}
            name="login"
            onFinish={handleLogin}
            initialValues={{ remember: true }}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="用户名"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="密码"
              />
            </Form.Item>
            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="login-button"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
