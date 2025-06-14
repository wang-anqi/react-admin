import React, { useEffect, useState } from 'react';
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
  Tabs,
  Typography,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { setToken, fetchUserInfo } from '../store/userSlice'
import type { RootState } from '../store';
import type { LoginParams, RegisterParams } from '../types/user';


import './login.css';

import axiosInstance from '../services/auth'

const { Title } = Typography;
const { TabPane } = Tabs;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState('login');
  const [form] = Form.useForm();

  const getUser = async () => {
    const res = await axiosInstance.get('/users')
    return res.data
  }
  // 处理登录
  const handleLogin = async (values: LoginParams) => {
    console.log('开始登录请求:', values);
    try {
      console.log('发送登录请求...');
      const res = await axiosInstance.post('/auth/login', values);
      // const res = await axios.post('http://localhost:5000/api/auth/login', values);


      console.log('登录请求响应:', res.data);

      const { token, role } = res.data;

      if (token && role) {
        // 保存 token 和 role
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);

        message.success('登录成功');

        dispatch(setToken(token));
        // /auth/me  异步获取user数据，更新userSlice中用户信息
        // await dispatch(fetchUserInfo());
        const result = await dispatch(fetchUserInfo());
        console.log(result);

        // 等待 Redux 异步 Action 完成后，确认成功再做跳转，确保用户信息加载成功，从而避免「登录后立即跳转却被 AuthGuard 判定未登录」的问题。
        // 使用 Redux Toolkit 自带的 fulfilled.match(result) 判断请求是否成功
        if (fetchUserInfo.fulfilled.match(result)) {
          navigate('/', { replace: true });
        }


      } else {
        console.error('登录响应数据不完整:', res.data);
        message.error('登录失败：响应数据不完整');
      }
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败：' + (error as Error).message);
    }
  };


  // 处理注册
  const handleRegister = async (values: RegisterParams) => {
    try {
      console.log('注册');

    } catch (error) {
      message.error('注册失败：' + (error as Error).message);
    }
  };

  // 处理忘记密码
  const handleForgotPassword = async (values: { email: string }) => {
    try {
      console.log('忘记密码');

    } catch (error) {
      message.error('发送失败：' + (error as Error).message);
    }
  };

  useEffect(() => {
    const data = getUser();

    console.log('异步请求', data);

  }, [])

  return (
    <div className="login-container">
      <div className="login-content">
        <Card className="login-card">
          <Title level={2} className="login-title">
            后台管理系统
          </Title>
          <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
            <TabPane tab="登录" key="login">
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
                  <div className="login-form-options">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>记住我</Checkbox>
                    </Form.Item>
                    <a
                      className="forgot-link"
                      onClick={() => setActiveTab('forgot')}
                    >
                      忘记密码
                    </a>
                  </div>
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
            </TabPane>
            <TabPane tab="注册" key="register">
              <Form
                form={form}
                name="register"
                onFinish={handleRegister}
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
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="input-icon" />}
                    placeholder="邮箱"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码长度不能小于6位' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="input-icon" />}
                    placeholder="密码"
                  />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="input-icon" />}
                    placeholder="确认密码"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-button"
                  >
                    注册
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="忘记密码" key="forgot">
              <Form
                form={form}
                name="forgot"
                onFinish={handleForgotPassword}
                size="large"
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="input-icon" />}
                    placeholder="请输入注册邮箱"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-button"
                  >
                    发送重置密码邮件
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
