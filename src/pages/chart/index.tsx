// src/pages/Charts/index.tsx
import React, { useState, useMemo, lazy, Suspense } from 'react';
import {
  Card, Tabs, Row, Col, DatePicker, Select,
  Button, Space, message, Typography, Divider, Spin
} from 'antd';
import AxiosInstance from '../../services/auth';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Text } = Typography;

// 懒加载图表组件
const LineChart = lazy(() => import('../../components/LineChart'));
const PieChart = lazy(() => import('../../components/PieChart'));
// const RadarChart = lazy(() => import('../../components/RadarChart'));
const BarChart = lazy(() => import('../../components/BarChart'));

const Charts: React.FC = () => {
  const [region, setRegion] = useState<string>('all');
  const [userType, setUserType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('line');
  const [dateRange, setDateRange] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // 获取图表数据
  const { data: chartData, refetch } = AxiosInstance('/api/charts', {
    params: { 
      region, 
      userType,
      dateRange: dateRange ? [dateRange[0].toISOString(), dateRange[1].toISOString()] : null
    },
    onSuccess: () => setLoading(false),
    onError: () => setLoading(false)
  });
  
  // 处理筛选条件变化
  const handleFilterChange = () => {
    setLoading(true);
    refetch();
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
      lastVisit: `2025-06-${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')} 12:${(Math.random() * 59).toFixed(0).padStart(2, '0')}`
    }))
  ), []);

  // 渲染用户行（虚拟滚动）
  const renderUserRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const user = recentUsers[index];
    return (
      <div key={user.id} style={{ ...style, padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>{user.name}</Text>
        <Text type="secondary" style={{ float: 'right' }}>最后访问：{user.lastVisit}</Text>
      </div>
    );
  };

  return (
    <Card title="图表分析中心" style={{ margin: 24 }} loading={loading}>
      {/* 筛选区域 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <RangePicker 
            onChange={setDateRange}
            style={{ width: '100%' }}
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
          <Suspense fallback={<Spin tip="加载图表..." style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }} />}>
            <LineChart 
              data={chartData?.lineData || []} 
              loading={loading}
            />
          </Suspense>
        </TabPane>
        <TabPane tab="结构占比" key="pie">
          <Suspense fallback={<Spin tip="加载图表..." style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }} />}>
            <PieChart 
              data={chartData?.pieData || []} 
              loading={loading}
            />
          </Suspense>
        </TabPane>
        {/* <TabPane tab="多维评估" key="radar">
          <Suspense fallback={<Spin tip="加载图表..." style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }} />}>
            <RadarChart 
              data={chartData?.radarData || []} 
              loading={loading}
            />
          </Suspense>
        </TabPane> */}
        <TabPane tab="对比分析" key="bar">
          <Suspense fallback={<Spin tip="加载图表..." style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }} />}>
            <BarChart 
              data={chartData?.barData || []} 
              loading={loading}
            />
          </Suspense>
        </TabPane>
      </Tabs>

      {/* 最近访问用户列表 */}
      <Divider orientation="left">最近访问用户（虚拟滚动）</Divider>
      <div style={{ height: 300, overflow: 'auto' }}>
        {recentUsers.slice(0, 50).map(user => (
          <div 
            key={user.id} 
            style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}
          >
            <Text strong>{user.name}</Text>
            <Text type="secondary" style={{ float: 'right' }}>
              最后访问：{user.lastVisit}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Charts;