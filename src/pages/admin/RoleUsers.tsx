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



interface User {
  id: number;
  username: string;
  email?: string;
  // role: 'admin' | 'manager' | 'user';
  role: string;
}

interface RoleTreeItem {
  title: string;
  key: string;
  children?: RoleTreeItem[];
};



// Mock 数据
const mockRoles = [
  {
    title: '管理员',
    key: 'admin',
    children: [
      { title: '系统管理员', key: 'admin:system' },
      { title: '权限管理员', key: 'admin:permission' }
    ]
  },
  {
    title: '用户组',
    key: 'user',
    children: [
      { title: '普通用户', key: 'user:common' },
      { title: '高级用户', key: 'user:vip' }
    ]
  }
];


// 获取用户列表
// const res = await axiosInstance.get('/users/usersList');
// //res.data.data 注意数据包裹关系
// setUsers(res.data.data);

const mockUsers = [
  { id: 1, username: 'alice', email: 'alice@example.com', role: 'admin:system' },
  { id: 2, username: 'bob', email: 'bob@example.com', role: 'user:vip' },
  { id: 3, username: 'charlie', email: 'charlie@example.com', role: 'user:common' },
];




const RoleUsers: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([])


  const [rolesTree, setRolesTree] = useState<RoleTreeItem[]>([])


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


  const fetchRolesTree = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/roles/rolesTree');
      //res.data.data 注意数据包裹关系
      setRolesTree(res.data.data);
      console.log('角色 res.data.data', res.data.data);



    } catch (error) {
      message.error('获取角色树数据失败');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    console.log('selectedRole', selectedRole);
    console.log('search', search);


    const usersFilter = users.filter(user => {
      const matchRole = selectedRole ? user.role === selectedRole : true;
      const matchSearch = user.username.includes(search) || user.email?.includes(search);
      return matchRole && matchSearch;
    });
    setFilteredUsers(usersFilter);
  }, [selectedRole, search]);

  const handleDeleteBatch = () => {
    message.success(`已移除 ${selectedRowKeys.length} 个用户`);
    setSelectedRowKeys([]);
  };


  useEffect(() => {
    fetchUsers();
    fetchRolesTree();

  }, []);


  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card title="角色树">
          <Tree
            treeData={rolesTree}
            onSelect={(keys) => setSelectedRole(keys[0] as string)}
            selectedKeys={[selectedRole]}
          />
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
                onSearch={(value)=>setSearch(value)}
                // onClick={(value) => setSearch(value)}
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
