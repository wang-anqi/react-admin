import React from 'react';
import { Layout, Menu, Dropdown, Avatar } from 'antd';
import {
    UserOutlined,
    DashboardOutlined,
    BarChartOutlined,
    TeamOutlined,
    SettingOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { clearUser } from '../../store/userSlice';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const menuConfig = [
    {
        key: '/dashboard',
        label: '仪表盘',
        icon: <DashboardOutlined />,
        roles: ['admin', 'manage', 'user'],
    },
    {
        key: '/chart',
        label: '图表',
        icon: <BarChartOutlined />,
        roles: ['admin', 'manage', 'user'],
    },
    {
        key: '/users',
        label: '用户管理',
        icon: <TeamOutlined />,
        roles: ['admin', 'manage'],
    },
    {
        key: '/roles',
        label: '角色管理',
        icon: <SettingOutlined />,
        roles: ['admin'],
    },
    {
        key: '/permissions',
        label: '权限管理',
        icon: <SettingOutlined />,
        roles: ['admin'],
    },
];

const AppLayout: React.FC = () => {
    const { userInfo } = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    console.log('userinfo',userInfo);
    const  data   = userInfo?.data;
    
    
    
    //   退出登录
    const handleLogout = () => {
        localStorage.removeItem('token');
        dispatch(clearUser());
        navigate('/login', { replace: true });
    };

    const userMenu: MenuProps['items'] = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: handleLogout,
        },
    ];

    const availableMenus = menuConfig.filter((item) =>
        data?.role ? item.roles.includes(data.role) : false
    );

    // 默认映射 / 到 /dashboard
    const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname;

    const selectedKey = menuConfig.find(menu => currentPath.startsWith(menu.key))?.key;

    console.log('location.pathname', location.pathname);



    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible>
                <div
                    style={{
                        height: 48,
                        margin: 16,
                        fontWeight: 'bold',
                        color: 'white',
                        fontSize: 18,
                        textAlign: 'center',
                    }}
                >
                    React
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={selectedKey ? [selectedKey] : []}

                    onClick={({ key }) => navigate(key)}
                    items={availableMenus}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        background: '#fff',
                        padding: '0 24px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}
                >
                    <Dropdown menu={{ items: userMenu }}>
                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                            <span>{userInfo?.username || '用户'}</span>
                        </div>
                    </Dropdown>
                </Header>
                <Content style={{ margin: '24px', background: '#fff', padding: 24 }}>
                    {/* 子页面渲染区域 */}
                    <React.Suspense fallback={<div>加载中...</div>}>
                        <Outlet />
                    </React.Suspense>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
