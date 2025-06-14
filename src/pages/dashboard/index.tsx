import React from 'react';
import { Card, Typography } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.user);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>欢迎回来，{userInfo?.username}！</Title>
      <Card>
        <p>这是一个示例 Dashboard 页面。</p>
        <p>您的角色是：{userInfo?.role}</p>
        <p>您的权限包括：{userInfo?.permissions.join(', ')}</p>
      </Card>
    </div>
  );
};

export default Dashboard; 