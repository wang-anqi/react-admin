

import React, { useState } from 'react';
import { Tabs } from 'antd';
import RoleList from './RoleList'
import RoleUsers from './RoleUsers';

const { TabPane } = Tabs;

const RoleManage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('roles');

  return (
    <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
      <TabPane tab="角色管理" key="roles">
        <RoleList />
      </TabPane>
      <TabPane tab="角色成员" key="users">
        <RoleUsers />
      </TabPane>
    </Tabs>
  );
};

export default RoleManage;
