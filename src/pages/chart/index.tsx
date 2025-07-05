// src/pages/Charts/index.tsx
import React, { useState, useMemo, lazy, Suspense, useCallback, useRef, useEffect } from 'react';
import {
  Card, Tabs, Row, Col, DatePicker, Select,
  Button, Space, message, Typography, Divider, Spin,
  Input, Avatar, Tag, Badge, List, Pagination, Empty, Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
const { Search } = Input;

// 懒加载图表组件
const LineChart = lazy(() => import('../../components/LineChart'));
const PieChart = lazy(() => import('../../components/PieChart'));
const BarChart = lazy(() => import('../../components/BarChart'));

// 用户状态枚举
enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away'
}

// 用户类型
interface User {
  id: number;
  name: string;
  avatar?: string;
  lastVisit: string;
  status: UserStatus;
  visitCount: number;
  location: string;
  device: string;
  duration: number; // 在线时长（分钟）
}

// Mock数据 - 修正为正确的格式
const mockChartData = {
  lineData: [
    {
      name: '访问量',
      data: [
        { date: '2025-06-01', value: 150 },
        { date: '2025-06-02', value: 180 },
        { date: '2025-06-03', value: 165 },
        { date: '2025-06-04', value: 220 },
        { date: '2025-06-05', value: 195 },
        { date: '2025-06-06', value: 240 },
        { date: '2025-06-07', value: 280 },
      ]
    },
    {
      name: '新用户',
      data: [
        { date: '2025-06-01', value: 80 },
        { date: '2025-06-02', value: 95 },
        { date: '2025-06-03', value: 85 },
        { date: '2025-06-04', value: 110 },
        { date: '2025-06-05', value: 105 },
        { date: '2025-06-06', value: 125 },
        { date: '2025-06-07', value: 140 },
      ]
    }
  ],
  pieData: [
    { name: '华东地区', value: 35, color: '#1890ff' },
    { name: '华南地区', value: 28, color: '#52c41a' },
    { name: '华北地区', value: 22, color: '#faad14' },
    { name: '西南地区', value: 10, color: '#f5222d' },
    { name: '其他地区', value: 5, color: '#722ed1' },
  ],
  barData: {
    xAxisData: ['移动端', 'PC端', '平板端', '小程序', 'APP'],
    seriesData: [320, 150, 25, 80, 200]
  }
};

// 生成Mock用户数据
const generateMockUsers = (count: number): User[] => {
  const locations = ['北京', '上海', '深圳', '杭州', '广州', '成都', '武汉', '西安'];
  const devices = ['iPhone', 'Android', 'Windows', 'Mac', 'iPad'];
  const statuses = [UserStatus.ONLINE, UserStatus.OFFLINE, UserStatus.AWAY];
  
  return Array.from({ length: count }, (_, i) => {
    const lastVisitDays = Math.floor(Math.random() * 30);
    const lastVisitHours = Math.floor(Math.random() * 24);
    const lastVisitMinutes = Math.floor(Math.random() * 60);
    
    const lastVisitDate = new Date();
    lastVisitDate.setDate(lastVisitDate.getDate() - lastVisitDays);
    lastVisitDate.setHours(lastVisitHours, lastVisitMinutes);
    
    return {
      id: i + 1,
      name: `用户${String(i + 1).padStart(4, '0')}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      lastVisit: lastVisitDate.toLocaleString('zh-CN'),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      visitCount: Math.floor(Math.random() * 1000) + 1,
      location: locations[Math.floor(Math.random() * locations.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      duration: Math.floor(Math.random() * 480) + 10 // 10-490分钟
    };
  });
};

// 根据不同筛选条件生成不同的数据
const getMockDataByFilters = (region: string, userType: string, dateRange: any) => {
  let data = { ...mockChartData };
  
  if (region !== 'all') {
    const regionMultiplier = region === 'east' ? 1.2 : region === 'south' ? 0.8 : 1;
    
    data.lineData = data.lineData.map(series => ({
      ...series,
      data: series.data.map(item => ({
        ...item,
        value: Math.round(item.value * regionMultiplier)
      }))
    }));
    
    data.barData = {
      ...data.barData,
      seriesData: data.barData.seriesData.map(value => Math.round(value * regionMultiplier))
    };
  }
  
  if (userType === 'new') {
    data.lineData = data.lineData.filter(series => series.name === '新用户');
  } else if (userType === 'return') {
    data.lineData = [
      {
        name: '回访用户',
        data: [
          { date: '2025-06-01', value: 70 },
          { date: '2025-06-02', value: 85 },
          { date: '2025-06-03', value: 80 },
          { date: '2025-06-04', value: 110 },
          { date: '2025-06-05', value: 90 },
          { date: '2025-06-06', value: 115 },
          { date: '2025-06-07', value: 140 },
        ]
      }
    ];
  }
  
  if (dateRange && dateRange.length === 2) {
    console.log('日期范围筛选:', dateRange);
  }
  
  return data;
};

// 用户状态配置
const statusConfig = {
  [UserStatus.ONLINE]: { color: '#52c41a', text: '在线' },
  [UserStatus.OFFLINE]: { color: '#d9d9d9', text: '离线' },
  [UserStatus.AWAY]: { color: '#faad14', text: '离开' }
};

// 格式化在线时长
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  }
  return `${mins}分钟`;
};

const Charts: React.FC = () => {
  const [region, setRegion] = useState<string>('all');
  const [userType, setUserType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('line');
  const [dateRange, setDateRange] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // 添加图表引用
  const lineChartRef = useRef<any>(null);
  const pieChartRef = useRef<any>(null);
  const barChartRef = useRef<any>(null);
  
  // 用户列表相关状态
  const [users] = useState<User[]>(() => generateMockUsers(1000));
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [sortField, setSortField] = useState<'lastVisit' | 'visitCount' | 'duration'>('lastVisit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [userListLoading, setUserListLoading] = useState(false);
  
  // 根据筛选条件获取数据
  const chartData = useMemo(() => {
    return getMockDataByFilters(region, userType, dateRange);
  }, [region, userType, dateRange]);
  
  // 过滤和排序用户列表
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.location.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'lastVisit':
          aValue = new Date(a.lastVisit).getTime();
          bValue = new Date(b.lastVisit).getTime();
          break;
        case 'visitCount':
          aValue = a.visitCount;
          bValue = b.visitCount;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    return filtered;
  }, [users, searchTerm, statusFilter, sortField, sortOrder]);
  
  // 分页数据
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedUsers.slice(startIndex, endIndex);
  }, [filteredAndSortedUsers, currentPage, pageSize]);
  
  // 处理筛选条件变化
  const handleFilterChange = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('筛选条件已应用');
    }, 1000);
  };

  // 实现导出图片功能
  const handleExportImage = useCallback(() => {
    try {
      let chartInstance = null;
      let fileName = '';

      // 根据当前活跃的tab获取对应的图表实例
      switch (activeTab) {
        case 'line':
          chartInstance = lineChartRef.current?.getChartInstance?.();
          fileName = `趋势分析图_${new Date().toISOString().slice(0, 10)}.png`;
          break;
        case 'pie':
          chartInstance = pieChartRef.current?.getChartInstance?.();
          fileName = `结构占比图_${new Date().toISOString().slice(0, 10)}.png`;
          break;
        case 'bar':
          chartInstance = barChartRef.current?.getChartInstance?.();
          fileName = `对比分析图_${new Date().toISOString().slice(0, 10)}.png`;
          break;
        default:
          message.error('无法获取图表实例');
          return;
      }

      if (!chartInstance) {
        message.error('图表尚未加载完成，请稍后再试');
        return;
      }

      // 获取图表的base64数据
      const base64 = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2, // 提高图片质量
        backgroundColor: '#fff' // 设置背景色
      });

      // 创建下载链接
      const link = document.createElement('a');
      link.href = base64;
      link.download = fileName;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('图表已成功导出为图片');
    } catch (error) {
      console.error('导出图片失败:', error);
      message.error('导出图片失败，请重试');
    }
  }, [activeTab]);
  
  // 刷新用户列表
  const handleRefreshUsers = () => {
    setUserListLoading(true);
    setTimeout(() => {
      setUserListLoading(false);
      message.success('用户列表已刷新');
    }, 800);
  };
  
  // 处理排序
  const handleSort = (field: 'lastVisit' | 'visitCount' | 'duration') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <Card title="图表分析中心" style={{ margin: 24 }} loading={loading}>
      {/* 筛选区域 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <RangePicker 
            onChange={setDateRange}
            style={{ width: '100%' }}
            placeholder={['开始日期', '结束日期']}
          />
        </Col>
        <Col>
          <Select 
            value={region} 
            onChange={setRegion}
            style={{ width: 120 }} 
            placeholder="地区"
          >
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="east">华东</Select.Option>
            <Select.Option value="south">华南</Select.Option>
            <Select.Option value="north">华北</Select.Option>
            <Select.Option value="southwest">西南</Select.Option>
          </Select>
        </Col>
        <Col>
          <Select 
            value={userType} 
            onChange={setUserType}
            style={{ width: 120 }} 
            placeholder="用户类型"
          >
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="new">新用户</Select.Option>
            <Select.Option value="return">回访用户</Select.Option>
          </Select>
        </Col>
        <Col>
          <Button 
            type="primary"
            onClick={handleFilterChange}
            loading={loading}
          >
            应用筛选
          </Button>
        </Col>
        <Col flex="auto">
          <Space style={{ float: 'right' }}>
            <Button 
              onClick={handleExportImage}
              icon={<span role="img" aria-label="image">🖼️</span>}
            >
              导出图片
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        type="card"
        tabBarStyle={{ marginBottom: 0 }}
      >
        <TabPane tab="趋势分析" key="line">
          <Suspense fallback={
            <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spin tip="加载图表..." size="large" />
            </div>
          }>
            <LineChart 
              ref={lineChartRef}
              data={chartData?.lineData || []} 
              loading={loading}
            />
          </Suspense>
        </TabPane>
        
        <TabPane tab="结构占比" key="pie">
          <Suspense fallback={
            <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spin tip="加载图表..." size="large" />
            </div>
          }>
            <PieChart 
              ref={pieChartRef}
              data={chartData?.pieData || []} 
              loading={loading}
            />
          </Suspense>
        </TabPane>
        
        <TabPane tab="对比分析" key="bar">
          <Suspense fallback={
            <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spin tip="加载图表..." size="large" />
            </div>
          }>
            <BarChart 
              ref={barChartRef}
              data={chartData?.barData || { xAxisData: [], seriesData: [] }} 
              loading={loading}
            />
          </Suspense>
        </TabPane>
      </Tabs>

      {/* 用户活动分析 */}
      <Divider orientation="left">
        <Title level={4} style={{ margin: 0 }}>
          用户活动分析
        </Title>
      </Divider>
      
      <Card 
        title={
          <Space>
            <UserOutlined />
            <span>实时用户列表</span>
            <Badge 
              count={filteredAndSortedUsers.length} 
              style={{ backgroundColor: '#52c41a' }} 
            />
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefreshUsers}
              loading={userListLoading}
              size="small"
            >
              刷新
            </Button>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        {/* 用户列表筛选工具栏 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Search
              placeholder="搜索用户名或地区..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              placeholder="状态筛选"
            >
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value={UserStatus.ONLINE}>在线</Select.Option>
              <Select.Option value={UserStatus.OFFLINE}>离线</Select.Option>
              <Select.Option value={UserStatus.AWAY}>离开</Select.Option>
            </Select>
          </Col>
          <Col>
            <Space>
              <Button
                size="small"
                type={sortField === 'lastVisit' ? 'primary' : 'default'}
                onClick={() => handleSort('lastVisit')}
                icon={sortField === 'lastVisit' && sortOrder === 'asc' ? 
                  <SortAscendingOutlined /> : <SortDescendingOutlined />}
              >
                最后访问
              </Button>
              <Button
                size="small"
                type={sortField === 'visitCount' ? 'primary' : 'default'}
                onClick={() => handleSort('visitCount')}
                icon={sortField === 'visitCount' && sortOrder === 'asc' ? 
                  <SortAscendingOutlined /> : <SortDescendingOutlined />}
              >
                访问次数
              </Button>
              <Button
                size="small"
                type={sortField === 'duration' ? 'primary' : 'default'}
                onClick={() => handleSort('duration')}
                icon={sortField === 'duration' && sortOrder === 'asc' ? 
                  <SortAscendingOutlined /> : <SortDescendingOutlined />}
              >
                在线时长
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 用户列表 */}
        {filteredAndSortedUsers.length === 0 ? (
          <Empty 
            description="没有找到匹配的用户"
            style={{ margin: '40px 0' }}
          />
        ) : (
          <>
            <List
              dataSource={paginatedUsers}
              loading={userListLoading}
              renderItem={(user) => (
                <List.Item
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    marginBottom: 8,
                    backgroundColor: '#fafafa',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                    e.currentTarget.style.borderColor = '#1890ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        dot 
                        color={statusConfig[user.status].color}
                        offset={[-6, 6]}
                      >
                        <Avatar 
                          src={user.avatar} 
                          icon={<UserOutlined />}
                          size={48}
                        />
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>
                          {user.name}
                        </Text>
                        <Tag color={statusConfig[user.status].color}>
                          {statusConfig[user.status].text}
                        </Tag>
                        <Tag color="blue">{user.location}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Space>
                          <ClockCircleOutlined />
                          <Text type="secondary">
                            最后访问：{user.lastVisit}
                          </Text>
                        </Space>
                        <Space split={<Divider type="vertical" />}>
                          <Text type="secondary">
                            访问 {user.visitCount} 次
                          </Text>
                          <Text type="secondary">
                            在线 {formatDuration(user.duration)}
                          </Text>
                          <Text type="secondary">
                            设备：{user.device}
                          </Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
            
            {/* 分页 */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredAndSortedUsers.length}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size || pageSize);
                }}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条用户`
                }
                pageSizeOptions={['10', '20', '50', '100']}
              />
            </div>
          </>
        )}
      </Card>
    </Card>
  );
};

export default Charts;