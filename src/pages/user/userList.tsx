import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Typography, message } from 'antd';
import { useSelector } from 'react-redux';
import axiosInstance from '../../services/auth';
import type { RootState } from '../../store';
import HasPermission from '../../components/HasPermission';


const { Title } = Typography;

interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'manage' | 'user';
}
const mockUsers = [
  { id: 1, username: 'admin', role: 'admin', email: 'admin@example.com' },
  { id: 2, username: 'manager', role: 'manage', email: 'manager@example.com' },
  { id: 3, username: 'user', role: 'user', email: 'user@example.com' },
];

const UserList: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/users/usersList');
      //res.data.data 注意数据包裹关系
      setUsers(res.data.data);
      console.log(res.data);
      
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };


  const deleteUser = async ()=>{
    '调用delete'
    await axiosInstance.delete('/users//deleteUser/1')
  }

  useEffect(() => {
    fetchUsers();
    deleteUser();
    
  }, []);

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
      render: (_: any, record: User) => (
        <Space>
          <HasPermission
            code="user:edit"
            noMatch={<span style={{ color: '#ccc' }}>无编辑权限</span>}
          >
            <Button type="link">编辑</Button>
          </HasPermission>
          <HasPermission
            code="user:delete"
            noMatch={<span style={{ color: '#ccc' }}>无删除权限</span>}
          >
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
        <HasPermission
          code="user:add"
          noMatch={<span style={{ color: '#ccc' }}>无新增权限</span>}
        >
          <Button type="primary" style={{ marginBottom: 16 }}>新增用户</Button>
        </HasPermission>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          // dataSource={mockUsers}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default UserList;
