import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';

export interface UserFormValues {
  username: string;
  email?: string;
  role: 'admin' | 'manage' | 'user';
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
          <Select placeholder="请选择角色">
            <Select.Option value="admin">管理员</Select.Option>
            <Select.Option value="manage">经理</Select.Option>
            <Select.Option value="user">普通用户</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
