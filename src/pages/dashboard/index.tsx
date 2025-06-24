// src/pages/Dashboard/index.tsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Card, Row, Col, Spin, Select, Button } from 'antd';
import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import HasPermission from '@/components/HasPermission';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import AxiosInstance from '../../services/auth';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import './DashboardPage.css';

// 懒加载图表组件
const BarChart = lazy(() => import('../../components/BarChart'));
const PieChart = lazy(() => import('../../components/PieChart'));
const LineChart = lazy(() => import('../../components/LineChart'));
const HeatmapChart = lazy(() => import('../../components/HeatmapChart'));

const Dashboard: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.user);
  const [timeRange, setTimeRange] = useState<string>('week');
  const [loading, setLoading] = useState(true);

  // 获取仪表盘数据
  const { data: dashboardData, refetch, loading: dataLoading } = AxiosInstance('/api/dashboard', {
    params: { range: timeRange },
    onSuccess: () => setLoading(false),
    onError: () => setLoading(false)
  });

  // 处理时间范围变化
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setLoading(true);
  };

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    refetch();
  };

  // 导出数据
  const handleExport = () => {
    // 实际项目中这里会实现数据导出逻辑
    message.success('数据导出成功');
  };

  // KPI卡片数据
  const kpiData = useMemo(() => {
    if (!dashboardData) return [];

    return [
      {
        title: '总用户数',
        value: formatNumber(dashboardData.totalUsers),
        icon: '👥',
        color: '#1890ff',
        tooltip: '系统注册用户总数'
      },
      {
        title: '今日订单',
        value: formatNumber(dashboardData.todayOrders),
        icon: '📦',
        color: '#52c41a',
        tooltip: '今日产生的订单数量'
      },
      {
        title: '销售额',
        value: formatCurrency(dashboardData.totalSales),
        icon: '💰',
        color: '#faad14',
        tooltip: '今日销售总额'
      },
      {
        title: '转化率',
        value: `${dashboardData.conversionRate}%`,
        icon: '📈',
        color: '#f5222d',
        tooltip: '访客到客户的转化率'
      }
    ];
  }, [dashboardData]);

  // 时间范围选项
  const timeRangeOptions = [
    { label: '近7天', value: 'week' },
    { label: '近30天', value: 'month' },
    { label: '近90天', value: 'quarter' }
  ];

  // 数据加载状态处理
  useEffect(() => {
    if (dataLoading) {
      setLoading(true);
    }
  }, [dataLoading]);

  return (
    <div className="dashboard-page">
      {/* 页面标题和操作区 */}
      <div className="dashboard-header">
        <div>
          <h1>系统总览</h1>
          <div className="dashboard-subtitle">
            欢迎回来, {userInfo?.username} | 最后更新: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="dashboard-actions">
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新数据
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            导出数据
          </Button>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="dashboard-filters">
        <Select
          value={timeRange}
          onChange={handleTimeRangeChange}
          style={{ width: 120 }}
          disabled={loading}
        >
          {timeRangeOptions.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* KPI指标卡片 */}
      <Row gutter={16} className="kpi-row">
        {kpiData.map((kpi, index) => (
          <Col xs={24} sm={12} md={12} lg={6} key={index}>
            <Card className="kpi-card" hoverable loading={loading}>
              <div className="kpi-content" title={kpi.tooltip}>
                <div className="kpi-icon" style={{ backgroundColor: kpi.color }}>
                  {kpi.icon}
                </div>
                <div className="kpi-info">
                  <div className="kpi-title">{kpi.title}</div>
                  <div className="kpi-value">{kpi.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <div className="chart-container">
        <Row gutter={[24, 24]}>
          {/* 访问量柱状图 */}
          <Col xs={24} lg={12}>
            <Card
              title="访问量分析"
              className="chart-card"
              loading={loading}
              extra={<Button type="link">详情</Button>}
            >
              <Suspense fallback={<Spin tip="加载柱状图..." />}>
                <BarChart
                  data={dashboardData?.barData || []}
                  loading={loading}
                />
              </Suspense>
            </Card>
          </Col>

          {/* 数据占比分析 */}
          <Col xs={24} lg={12}>
            <Card
              title="数据占比"
              className="chart-card"
              loading={loading}
              extra={<Button type="link">详情</Button>}
            >
              <Suspense fallback={<Spin tip="加载饼图..." />}>
                <PieChart
                  data={dashboardData?.pieData || []}
                  loading={loading}
                />
              </Suspense>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* 用户增长趋势 */}
          <Col span={24}>
            <Card
              title="用户趋势"
              className="chart-card"
              loading={loading}
              extra={<Button type="link">详情</Button>}
            >
              <Suspense fallback={<Spin tip="加载折线图..." />}>
                <LineChart
                  data={dashboardData?.lineData || []}
                  loading={loading}
                />
              </Suspense>
            </Card>
          </Col>
        </Row>

        {/* 用户行为热力图 */}
        <Col span={24}>
          <HasPermission code="dashboard:heatmap" noMatch={
            <Card title="行为热力图" loading={loading}>
              <div style={{
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#999'
              }}>
                您无权限查看此内容
              </div>
            </Card>
          }>
            <Card
              title="用户行为热力图（仅管理员）"
              className="chart-card"
              loading={loading}
              extra={<Button type="link">详情</Button>}
            >
              <Suspense fallback={<Spin tip="加载热力图..." />}>
                <HeatmapChart
                  data={dashboardData?.heatmapData || []}
                  loading={loading}
                />
              </Suspense>
            </Card>
          </HasPermission>
        </Col>
      </div>
    </div>
  );
};

export default Dashboard;