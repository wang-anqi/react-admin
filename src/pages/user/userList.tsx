import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Typography, message } from 'antd';
import { useSelector } from 'react-redux';
import axiosInstance from '../../services/auth';
import type { RootState } from '../../store';
import HasPermission from '../../components/HasPermission';
import UserModal, { UserFormValues } from './component/UserModal';

const { Title } = Typography;

interface User {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'manager' | 'user';
}
// const mockUsers = [
//   { id: 1, username: 'admin', role: 'admin', email: 'admin@example.com' },
//   { id: 2, username: 'manager', role: 'manager', email: 'manager@example.com' },
//   { id: 3, username: 'user', role: 'user', email: 'user@example.com' },
// ];

const UserList: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/users/usersList');
      //res.data.data 注意数据包裹关系
      setUsers(res.data.data);
      console.log('res.data.data', res.data.data);



    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(undefined);
    setModalOpen(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    console.log('editRecod',record);
    
    setModalOpen(true);
  };

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        // 编辑用户：调用 /users/update/:id 接口
        // await axiosInstance.put(`/users/update/${editingUser.id}`, values);
        console.log('编辑');
        
        message.success('用户更新成功');
      } else {
        // 新增用户：调用 /users/create 接口
        // await axiosInstance.post('/users/create', values);
        console.log('新增');
        message.success('用户新增成功');
      }
  
      fetchUsers();          // 刷新用户列表
      setModalOpen(false);   // 关闭弹窗
    } catch (error) {
      message.error(editingUser ? '更新失败' : '新增失败');
    }
  };
  

  const deleteUser = async () => {
    // '调用delete'
    console.log('删除用户');

  }

  useEffect(() => {
    fetchUsers();
    // deleteUser();

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
            <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
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
        >
          <Button type="primary" style={{ marginBottom: 16 }} onClick={handleAdd}>新增用户</Button>
        </HasPermission>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          // dataSource={mockUsers}
          loading={loading}
        />
      </Card>
      <UserModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editingUser}
      />
    </div>
  );
};

export default UserList;

