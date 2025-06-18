import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  message,
  Modal,
  Form,
  Input,
  Tag,
  Popconfirm,
  Drawer,
  Checkbox,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  selectRoles,
  selectRoleLoading,
  selectRoleError,
  selectLastUpdated,
  clearError
} from '../../store/rolesSlice';

const { Title } = Typography;
const { TextArea } = Input;

interface Role {
  id: number;
  name: string;
  description: string;
  permissionDes?: string;
  permissions: string[];
}

interface RoleFormValues {
  name: string;
  description: string;
  permissions: string[];
}

// 预定义权限列表（根据实际项目调整）
const AVAILABLE_PERMISSIONS = [
  { value: 'user:view', label: '查看用户' },
  { value: 'user:add', label: '新增用户' },
  { value: 'user:edit', label: '编辑用户' },
  { value: 'user:delete', label: '删除用户' },
  { value: 'role:view', label: '查看角色' },
  { value: 'role:add', label: '新增角色' },
  { value: 'role:edit', label: '编辑角色' },
  { value: 'role:delete', label: '删除角色' },
  { value: 'permission:assign', label: '分配权限' },
  { value: 'system:config', label: '系统配置' },
  { value: 'system:log', label: '系统日志' },
];

const RoleManage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 从 Redux 获取角色数据
  const roles = useSelector(selectRoles);
  const loading = useSelector(selectRoleLoading);
  const error = useSelector(selectRoleError);
  const lastUpdated = useSelector(selectLastUpdated);

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>();
  const [viewingRole, setViewingRole] = useState<Role | undefined>();
  const [submitting, setSubmitting] = useState(false); // 添加提交状态
  const [form] = Form.useForm();

  // 初始化加载角色数据
  useEffect(() => {
    console.log('组件挂载，开始获取角色数据...');
    dispatch(fetchRoles());
  }, [dispatch]);

  // 错误处理
  useEffect(() => {
    if (error) {
      message.error(`角色操作失败: ${error}`);
      console.error('角色操作错误:', error);
      // 3秒后自动清除错误状态
      setTimeout(() => {
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  // 监听角色数据变化，用于调试和确认同步状态
  useEffect(() => {
    if (roles && roles.length > 0) {
      console.log('角色数据已更新，当前角色数量:', roles.length);
      console.log('最后更新时间:', lastUpdated ? new Date(lastUpdated).toLocaleString() : '未知');
    }
  }, [roles, lastUpdated]);

  // 手动刷新角色数据
  const handleRefresh = () => {
    console.log('手动刷新角色数据...');
    dispatch(fetchRoles());
  };

  // 新增角色
  const handleAdd = () => {
    setEditingRole(undefined);
    form.resetFields();
    setModalOpen(true);
  };

  // 编辑角色
  const handleEdit = (record: Role) => {
    setEditingRole(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      permissions: record.permissions,
    });
    setModalOpen(true);
  };

  // 查看角色权限
  const handleView = (record: Role) => {
    setViewingRole(record);
    setDrawerOpen(true);
  };

  // 删除角色 - 使用 Redux action
  const handleDelete = async (record: Role) => {
    try {
      console.log('准备删除角色:', record.name, 'ID:', record.id);

      // 使用 Redux action 删除角色，自动处理前后端同步
      const result = await dispatch(deleteRole(record.id));

      if (deleteRole.fulfilled.match(result)) {
        message.success(`角色 "${record.name}" 删除成功`);
        console.log('角色删除成功，Redux 状态已同步');

        // 删除成功后刷新列表
        dispatch(fetchRoles());
      } else {
        // 如果删除失败，error 会通过 useEffect 显示
        console.log('角色删除失败');
        message.error('角色删除失败')
      }
    } catch (error) {
      console.error('删除角色异常:', error);
      message.error('删除角色时发生异常');
    }
  };

  // 提交表单 - 使用 Redux actions
  const handleSubmit = async (values: RoleFormValues) => {
    setSubmitting(true);

    try {
      console.log('提交角色数据:', values);

      let result;

      if (editingRole) {
        // 编辑角色 - 使用 Redux updateRole action
        console.log('更新角色:', editingRole.id, values);
        result = await dispatch(updateRole({
          id: editingRole.id,
          ...values
        }));

        if (updateRole.fulfilled.match(result)) {
          message.success(`角色 "${values.name}" 更新成功`);
          console.log('角色更新成功，Redux 状态已同步');

          // 更新成功后刷新列表
          dispatch(fetchRoles());
        }
      } else {
        // 新增角色 - 使用 Redux createRole action
        console.log('创建新角色:', values);
        result = await dispatch(createRole(values));

        if (createRole.fulfilled.match(result)) {
          message.success(`角色 "${values.name}" 创建成功`);
          console.log('角色创建成功，Redux 状态已同步');

          // 新增成功后刷新列表
          dispatch(fetchRoles());
        }
      }

      // 如果操作成功，关闭弹窗
      if (result.meta.requestStatus === 'fulfilled') {
        setModalOpen(false);
        form.resetFields();
      }

    } catch (error) {
      console.error('提交角色数据异常:', error);
      message.error('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 获取权限标签颜色
  const getPermissionColor = (permission: string) => {
    if (permission.includes('view')) return 'blue';
    if (permission.includes('add')) return 'green';
    if (permission.includes('edit')) return 'orange';
    if (permission.includes('delete')) return 'red';
    if (permission.includes('assign')) return 'purple';
    return 'default';
  };

  // 获取权限中文名称
  const getPermissionLabel = (permission: string) => {
    const found = AVAILABLE_PERMISSIONS.find(p => p.value === permission);
    return found ? found.label : permission;
  };

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string) => (
        <Tag color="blue" style={{ fontSize: '13px', padding: '4px 8px' }}>
          {text || '未命名'}
        </Tag>
      ),
    },
    {
      title: '角色描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 150,
      render: (text: string) => text || '暂无描述',
    },
    {
      title: '权限描述',
      dataIndex: 'permissionDes',
      key: 'permissionDes',
      ellipsis: true,
      width: 180,
      render: (text: string) => text || '暂无权限描述',
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissionCount',
      width: 100,
      align: 'center' as const,
      render: (permissions: string[] | undefined) => {
        const count = Array.isArray(permissions) ? permissions.length : 0;
        return (
          <Tag color={count > 0 ? 'green' : 'default'}>
            {count} 个权限
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      render: (_: any, record: Role) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
          >
            查看权限
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={
              <div>
                <p>确定要删除角色 <strong>{record.name}</strong> 吗？</p>
                <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
                  删除后无法恢复，且如果有用户使用该角色将无法删除
                </p>
              </div>
            }
            onConfirm={() => handleDelete(record)}
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
              size="small"
              disabled={record.name === 'admin'} // 禁止删除admin角色
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];



  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>角色管理</Title>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增角色
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              title="刷新角色数据"
            >
              刷新
            </Button>
          </Space>
          <Space>
            <div style={{ color: '#666', fontSize: '14px' }}>
              共 {roles?.length || 0} 个角色
            </div>
            {lastUpdated && (
              <div style={{ color: '#999', fontSize: '12px' }}>
                最后更新: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={roles}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          scroll={{ x: 850 }}
          size="middle"
        />
      </Card>

      {/* 新增/编辑角色弹窗 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {editingRole ? <EditOutlined style={{ marginRight: 8 }} /> : <PlusOutlined style={{ marginRight: 8 }} />}
            {editingRole ? '编辑角色' : '新增角色'}
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
        destroyOnClose
        okText={editingRole ? '更新' : '创建'}
        cancelText="取消"
        confirmLoading={submitting} // 添加提交加载状态
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ permissions: [] }}
        >
          <Form.Item
            label="角色名称"
            name="name"
            rules={[
              { required: true, message: '请输入角色名称' },
              { min: 2, max: 20, message: '角色名称长度应在2-20个字符之间' }
            ]}
          >
            <Input placeholder="请输入角色名称，如：manager、user等" />
          </Form.Item>

          <Form.Item
            label="角色描述"
            name="description"
            rules={[{ max: 100, message: '描述不能超过100个字符' }]}
          >
            <TextArea
              placeholder="请输入角色描述，如：系统管理员、业务管理员等"
              rows={3}
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item label="权限配置" name="permissions">
          
              <Checkbox.Group style={{ width: '100%' }}>
                <Row gutter={[16, 12]}>
                  {AVAILABLE_PERMISSIONS.map(permission => (
                    <Col span={8} key={permission.value}>
                      <Checkbox value={permission.value}>
                        <span style={{ fontSize: '13px' }}>{permission.label}</span>
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
          

          </Form.Item>
        </Form>
      </Modal>

      {/* 查看角色权限抽屉 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EyeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            角色权限详情 - {viewingRole?.name}
          </div>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
      >
        {viewingRole && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0, marginBottom: 12 }}>基本信息</Title>
              <div style={{ lineHeight: '28px' }}>
                <p><strong>角色名称：</strong>
                  <Tag color="blue" style={{ marginLeft: 8 }}>{viewingRole.name}</Tag>
                </p>
                <p><strong>角色描述：</strong>{viewingRole.description || '暂无描述'}</p>
                <p><strong>权限描述：</strong>{viewingRole.permissionDes || '暂无权限描述'}</p>
              </div>
            </Card>

            <Card size="small">
              <Title level={5} style={{ margin: 0, marginBottom: 12 }}>
                权限列表 ({viewingRole.permissions?.length || 0} 个权限)
              </Title>
              {viewingRole.permissions && viewingRole.permissions.length > 0 ? (
                <Space wrap size={[8, 8]}>
                  {viewingRole.permissions.map(permission => (
                    <Tag
                      key={permission}
                      color={getPermissionColor(permission)}
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      {getPermissionLabel(permission)}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#999',
                  padding: '20px',
                  background: '#fafafa',
                  borderRadius: '6px'
                }}>
                  该角色暂无权限
                </div>
              )}
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RoleManage;