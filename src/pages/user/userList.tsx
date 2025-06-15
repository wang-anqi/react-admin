import React from 'react';
import { Card, Table, Button, Space, Typography } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import HasPermission from '../../components/HasPermission';

const { Title } = Typography;

const mockUsers = [
  { id: 1, username: 'admin', role: 'admin', email: 'admin@example.com' },
  { id: 2, username: 'manager', role: 'manage', email: 'manager@example.com' },
  { id: 3, username: 'user', role: 'user', email: 'user@example.com' },
];

const UserList: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.user);

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
    },
    {
      title: '操作',
      render: (_: any, record: any) => (
        <Space>
          <HasPermission code="user:edit">
            <Button type="link">编辑</Button>
          </HasPermission>
          <HasPermission code="user:delete">
            <Button type="link" danger>删除</Button>
          </HasPermission>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>用户管理</Title>
      <Card>
        <HasPermission code="user:add">
          <Button type="primary" style={{ marginBottom: 16 }}>新增用户</Button>
        </HasPermission>
        <Table rowKey="id" columns={columns} dataSource={mockUsers} />
      </Card>
    </div>
  );
};

export default UserList;
