import React from 'react';
import { Card, Typography } from 'antd';


const { Title } = Typography;

const UserList: React.FC = () => {
  

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>欢迎回来</Title>
      <Card>
        <p>这是一个示例 UserList 页面。</p>
      
      </Card>
    </div>
  );
};

export default UserList; 