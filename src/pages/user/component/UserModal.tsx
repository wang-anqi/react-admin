import React, { useDeferredValue, useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { fetchRoles, selectRoles, selectRoleLoading } from '@/store/rolesSlice';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store';
export interface UserFormValues {
  username: string;
  email?: string;
  // role: 'admin' | 'manager' | 'user';
  role: string;
}

interface UserModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: UserFormValues) => void;
  initialValues?: Partial<UserFormValues>;
}

const UserModal: React.FC<UserModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();
  console.log('initialValues',initialValues);
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector(selectRoles);
  const loading = useSelector(selectRoleLoading);
  
  useEffect(()=>{
    dispatch(fetchRoles());
    
    
  },[dispatch])

  useEffect(()=>{
   
    console.log('roles',roles);
    
  },[roles])
  // 初始化或重置表单
  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues || {});
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (err) {
      // 校验失败
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={initialValues ? '编辑用户' : '新增用户'}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="userForm">
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item label="邮箱" name="email">
          <Input placeholder="请输入邮箱（可选）" />
        </Form.Item>
        <Form.Item
          label="角色"
          name="role"
          rules={[{ required: true, message: '请选择角色' }]}
        >
          <Select placeholder="请选择角色" 
          loading={loading}
          disabled={loading}
          >
            {roles?.map((role) => (
              <Select.Option key={role.id} value={role.name}>
                {role.description}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
