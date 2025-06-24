// src/pages/Charts/index.tsx
import React, { useState, useMemo, lazy, Suspense } from 'react';
import {
  Card, Tabs, Row, Col, DatePicker, Select,
  Button, Space, message, Typography, Divider, Spin
} from 'antd';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Text } = Typography;

// 懒加载图表组件
const LineChart = lazy(() => import('../../components/LineChart'));
const PieChart = lazy(() => import('../../components/PieChart'));
// const RadarChart = lazy(() => import('../../components/RadarChart'));
const BarChart = lazy(() => import('../../components/BarChart'));

// Mock数据 - 修正为正确的格式
const mockChartData = {
  // LineChart期望格式: { name: string, data: { date: string, value: number }[] }[]
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
  
  // PieChart期望格式: { name: string, value: number, color?: string }[] - 格式已正确
  pieData: [
    { name: '华东地区', value: 35, color: '#1890ff' },
    { name: '华南地区', value: 28, color: '#52c41a' },
    { name: '华北地区', value: 22, color: '#faad14' },
    { name: '西南地区', value: 10, color: '#f5222d' },
    { name: '其他地区', value: 5, color: '#722ed1' },
  ],
  
  // BarChart期望格式: { xAxisData: string[], seriesData: number[] }
  barData: {
    xAxisData: ['移动端', 'PC端', '平板端', '小程序', 'APP'],
    seriesData: [320, 150, 25, 80, 200]
  }
};

// 根据不同筛选条件生成不同的数据
const getMockDataByFilters = (region: string, userType: string, dateRange: any) => {
  // 基础数据
  let data = { ...mockChartData };
  
  // 根据地区筛选调整数据
  if (region !== 'all') {
    const regionMultiplier = region === 'east' ? 1.2 : region === 'south' ? 0.8 : 1;
    
    // 调整折线图数据
    data.lineData = data.lineData.map(series => ({
      ...series,
      data: series.data.map(item => ({
        ...item,
        value: Math.round(item.value * regionMultiplier)
      }))
    }));
    
    // 调整柱状图数据
    data.barData = {
      ...data.barData,
      seriesData: data.barData.seriesData.map(value => Math.round(value * regionMultiplier))
    };
  }
  
  // 根据用户类型筛选
  if (userType === 'new') {
    // 只显示新用户数据
    data.lineData = data.lineData.filter(series => series.name === '新用户');
  } else if (userType === 'return') {
    // 模拟回访用户数据
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
  
  // 根据日期范围调整（这里简单模拟）
  if (dateRange && dateRange.length === 2) {
    // 实际项目中这里会根据日期范围过滤数据
    console.log('日期范围筛选:', dateRange);
  }
  
  return data;
};

const Charts: React.FC = () => {
  const [region, setRegion] = useState<string>('all');
  const [userType, setUserType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('line');
  const [dateRange, setDateRange] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // 根据筛选条件获取数据
  const chartData = useMemo(() => {
    return getMockDataByFilters(region, userType, dateRange);
  }, [region, userType, dateRange]);
  
  // 处理筛选条件变化
  const handleFilterChange = () => {
    setLoading(true);
    // 模拟异步请求
    setTimeout(() => {
      setLoading(false);
      message.success('筛选条件已应用');
    }, 1000);
  };

  // 导出图片
  const handleExportImage = () => {
    message.success('图表已导出为图片');
  };

  // 导出Excel
  const handleExportExcel = () => {
    message.success('数据已导出为Excel');
  };
  
  // 最近访问用户数据（虚拟滚动）
  const recentUsers = useMemo(() => (
    Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `用户 ${i + 1}`,
      lastVisit: `2025-06-${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')} 12:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
    }))
  ), []);

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
            <Button 
              onClick={handleExportExcel}
              icon={<span role="img" aria-label="excel">📊</span>}
            >
              导出Excel
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
              data={chartData?.pieData || []} 
              loading={loading}
            />
          </Suspense>
        </TabPane>
        
        {/* <TabPane tab="多维评估" key="radar">
          <Suspense fallback={
            <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spin tip="加载图表..." size="large" />
            </div>
          }>
            <RadarChart 
              data={chartData?.radarData || []} 
              loading={loading}
            />
          </Suspense>
        </TabPane> */}
        
        <TabPane tab="对比分析" key="bar">
          <Suspense fallback={
            <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spin tip="加载图表..." size="large" />
            </div>
          }>
            <BarChart 
              data={chartData?.barData || { xAxisData: [], seriesData: [] }} 
              loading={loading}
            />
          </Suspense>
        </TabPane>
      </Tabs>

      {/* 最近访问用户列表 */}
      <Divider orientation="left">最近访问用户</Divider>
      <div style={{ 
        height: 300, 
        overflow: 'auto',
        border: '1px solid #f0f0f0',
        borderRadius: 6,
        backgroundColor: '#fafafa'
      }}>
        {recentUsers.slice(0, 50).map(user => (
          <div 
            key={user.id} 
            style={{ 
              padding: '8px 16px', 
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#fff',
              margin: '4px 8px',
              borderRadius: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Text strong>{user.name}</Text>
            <Text type="secondary">
              最后访问：{user.lastVisit}
            </Text>
          </div>
        ))}
        {recentUsers.length > 50 && (
          <div style={{ 
            padding: '16px', 
            textAlign: 'center',
            color: '#999'
          }}>
            <Text type="secondary">还有 {recentUsers.length - 50} 条数据...</Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Charts;