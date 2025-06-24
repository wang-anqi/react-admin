import React, { useState, useMemo, useRef } from 'react';
import {
  Card, Tabs, Row, Col, DatePicker, Select,
  Button, Space, message, Typography, Divider
} from 'antd';
import ReactECharts from 'echarts-for-react';
import type { ECharts } from 'echarts';
import * as XLSX from 'xlsx';
import { FixedSizeList as List } from 'react-window';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const Charts: React.FC = () => {
  const [region, setRegion] = useState<string>('all');
  const [userType, setUserType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('line');

  const chartRefs = {
    line: useRef<ECharts | null>(null),
    pie: useRef<ECharts | null>(null),
    radar: useRef<ECharts | null>(null),
    bar: useRef<ECharts | null>(null)
  };

  const handleExportImage = () => {
    const ref = chartRefs[activeTab];
    if (ref?.current) {
      const url = ref.current.getDataURL({ pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = url;
      a.download = `chart-${activeTab}.png`;
      a.click();
    } else {
      message.warning('请先查看对应图表后再导出');
    }
  };

  const handleExportExcel = () => {
    const data = [['月份', '新增用户'], ['1月', 500], ['2月', 800], ['3月', 600], ['4月', 1000], ['5月', 1200], ['6月', 900]];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '趋势数据');
    XLSX.writeFile(wb, 'chart-data.xlsx');
    message.success('导出成功');
  };

  const lineOption = useMemo(() => ({
    title: { text: '用户增长趋势' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value' },
    series: [{ name: '新增用户', type: 'line', data: [500, 800, 600, 1000, 1200, 900] }]
  }), [region, userType]);

  const pieOption = useMemo(() => ({
    title: { text: '用户来源结构', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 300, name: 'PC' },
        { value: 500, name: '移动' },
        { value: 200, name: '小程序' }
      ]
    }]
  }), []);

  const radarOption = useMemo(() => ({
    title: { text: '系统能力雷达图' },
    radar: {
      indicator: [
        { name: '性能', max: 100 },
        { name: '稳定性', max: 100 },
        { name: '安全性', max: 100 },
        { name: '体验', max: 100 },
        { name: '扩展性', max: 100 }
      ]
    },
    series: [{
      name: '系统评分',
      type: 'radar',
      data: [{ value: [80, 90, 85, 70, 88], name: '系统 A' }]
    }]
  }), []);

  const barOption = useMemo(() => ({
    title: { text: '模块使用对比' },
    xAxis: { type: 'category', data: ['首页', '用户中心', '设置页', '订单页'] },
    yAxis: { type: 'value' },
    series: [{ data: [300, 500, 200, 800], type: 'bar' }]
  }), []);

  const recentUsers = useMemo(() => (
    new Array(1000).fill(null).map((_, i) => ({
      id: i + 1,
      name: `用户 ${i + 1}`,
      lastVisit: `2025-06-${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')} 12:${(Math.random() * 59).toFixed(0).padStart(2, '0')}`
    }))
  ), []);

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
    <Card title="图表分析中心" style={{ margin: 24 }}>
      {/* 筛选区域 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <RangePicker />
        </Col>
        <Col>
          <Select value={region} onChange={setRegion} style={{ width: 120 }} placeholder="地区">
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="east">华东</Select.Option>
            <Select.Option value="south">华南</Select.Option>
          </Select>
        </Col>
        <Col>
          <Select value={userType} onChange={setUserType} style={{ width: 120 }} placeholder="用户类型">
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="new">新用户</Select.Option>
            <Select.Option value="return">回访用户</Select.Option>
          </Select>
        </Col>
        <Col flex="auto">
          <Space style={{ float: 'right' }}>
            <Button onClick={handleExportImage}>导出图表图片</Button>
            <Button onClick={handleExportExcel}>导出 Excel</Button>
          </Space>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane tab="趋势分析" key="line">
          <ReactECharts
            option={lineOption}
            style={{ height: 400 }}
            onChartReady={(chart) => { chartRefs.line.current = chart; }}
          />
        </TabPane>
        <TabPane tab="结构占比" key="pie">
          <ReactECharts
            option={pieOption}
            style={{ height: 400 }}
            onChartReady={(chart) => { chartRefs.pie.current = chart; }}
          />
        </TabPane>
        <TabPane tab="多维评估" key="radar">
          <ReactECharts
            option={radarOption}
            style={{ height: 400 }}
            onChartReady={(chart) => { chartRefs.radar.current = chart; }}
          />
        </TabPane>
        <TabPane tab="对比分析" key="bar">
          <ReactECharts
            option={barOption}
            style={{ height: 400 }}
            onChartReady={(chart) => { chartRefs.bar.current = chart; }}
          />
        </TabPane>
      </Tabs>

      {/* 最近访问用户列表 */}
      <Divider orientation="left">最近访问用户（虚拟滚动）</Divider>
      <List
        height={300}
        itemCount={recentUsers.length}
        itemSize={50}
        width="100%"
      >
        {renderUserRow}
      </List>
    </Card>
  );
};

export default Charts;
