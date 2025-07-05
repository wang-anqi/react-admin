import React, { useEffect, useState } from 'react';
import {
  Card,
  Input,
  Row,
  Col,
  Table,
  Tree,
  Button,
  Space,
  message,
  Popconfirm,
  Tag
} from 'antd';
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../../services/auth';
import { RootState } from '../../store';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchRoleTree,
  selectRoleTree,
  selectRoleTreeLoading,
  selectRoleTreeError,
  selectRoleTreeVersion,
  clearError
} from '../../store/rolesSlice';

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
}

const RoleUsers: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  // 从 Redux 获取角色树数据
  const roleTree = useSelector(selectRoleTree);
  const treeLoading = useSelector(selectRoleTreeLoading);
  const treeError = useSelector(selectRoleTreeError);
  const roleTreeVersion = useSelector(selectRoleTreeVersion);

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色标识', dataIndex: 'role', key: 'role', render: (text: string) => <Tag color="blue">{text}</Tag> },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="确认移除该用户?" onConfirm={() => message.success(`移除 ${record.username}`)}>
          <Button type="link" danger size="small">移除</Button>
        </Popconfirm>
      )
    }
  ];

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users/usersList');
      setUsers(res.data.data);
      console.log('用户列表数据:', res.data.data);
    } catch (error) {
      message.error('获取用户列表失败');
    }
  };

  // 错误处理
  useEffect(() => {
    if (treeError) {
      message.error(`获取角色树失败: ${treeError}`);
      console.error('角色树错误:', treeError);
      // 3秒后自动清除错误状态
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [treeError, dispatch]);

  // 初始化加载用户数据
  useEffect(() => {
    fetchUsers();
  }, []);

  // 当角色树版本变化时重新获取角色树
  useEffect(() => {
    console.log('角色树版本变化:', roleTreeVersion);
    dispatch(fetchRoleTree());
  }, [roleTreeVersion, dispatch]);

  // 当角色选择、搜索词或用户数据变化时过滤用户
  useEffect(() => {
    console.log('selectedRole', selectedRole);
    console.log('search', search);

    const usersFilter = users.filter(user => {
      const matchRole = selectedRole ? user.role === selectedRole : true;
      const matchSearch = user.username.includes(search) || (user.email && user.email.includes(search));
      return matchRole && matchSearch;
    });
    setFilteredUsers(usersFilter);
  }, [selectedRole, search, users]);

  const handleDeleteBatch = () => {
    message.success(`已移除 ${selectedRowKeys.length} 个用户`);
    setSelectedRowKeys([]);
  };

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card
          title="角色树"
          loading={treeLoading}
          extra={
            <Button
              icon={<ReloadOutlined />}
              onClick={() => dispatch(fetchRoleTree())}
              size="small"
            />
          }
        >
          {treeError ? (
            <div style={{ color: 'red', textAlign: 'center' }}>
              加载角色树失败: {treeError}
              <Button onClick={() => dispatch(fetchRoleTree())} style={{ marginTop: 10 }}>
                重试
              </Button>
            </div>
          ) : (
            <Tree
              treeData={roleTree}
              onSelect={(keys) => setSelectedRole(keys[0] as string)}
              selectedKeys={[selectedRole]}
            />
          )}
        </Card>
      </Col>

      <Col span={18}>
        <Card
          title="角色成员"
          extra={
            <Space>
              <Input.Search
                placeholder="搜索用户名或邮箱"
                allowClear
                onSearch={(value) => setSearch(value)}
                style={{ width: 240 }}
              />
              <Button icon={<ReloadOutlined />} onClick={() => setSearch('')}>
                重置
              </Button>
              <Popconfirm
                title="确认批量移除所选用户?"
                onConfirm={handleDeleteBatch}
                disabled={selectedRowKeys.length === 0}
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0}
                >
                  批量移除
                </Button>
              </Popconfirm>
            </Space>
          }
        >
          <Table
            rowKey="id"
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
            columns={columns}
            dataSource={filteredUsers}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default RoleUsers;