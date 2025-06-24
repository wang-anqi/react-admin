// src/pages/Dashboard.tsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import ReactECharts from 'echarts-for-react';
import HasPermission from '@/components/HasPermission';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const Dashboard: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.user);
  const user = userInfo?.data;

  // 1. 访问量柱状图
  const barChartOption = {
    title: { text: '日访问量' },
    tooltip: {},
    xAxis: {
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {},
    series: [
      {
        name: '访问量',
        type: 'bar',
        data: [120, 200, 150, 80, 70, 110, 130]
      }
    ]
  };

  // 2. 数据占比分析（饼图）
  const pieChartOption = {
    title: { text: '数据占比分析', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '占比',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 40, name: 'PC用户' },
          { value: 30, name: '移动用户' },
          { value: 20, name: '小程序' },
          { value: 10, name: '其他' }
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        }
      }
    ]
  };

  // 3. 趋势折线图
  const lineChartOption = {
    title: { text: '用户增长趋势' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '新增用户',
        type: 'line',
        data: [500, 800, 600, 1000, 1200, 900]
      }
    ]
  };

  // 4. 用户行为热力图（需要管理员权限）
  const heatMapOption = {
    title: { text: '用户行为热力图' },
    tooltip: {},
    grid: { height: '50%', top: '10%' },
    xAxis: {
      type: 'category',
      data: ['0点', '4点', '8点', '12点', '16点', '20点'],
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      splitArea: { show: true }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '10%'
    },
    series: [
      {
        name: '访问频率',
        type: 'heatmap',
        data: Array.from({ length: 42 }, (_, i) => [
          i % 6, // hour
          Math.floor(i / 6), // day
          Math.floor(Math.random() * 10)
        ]),
        label: { show: true },
        emphasis: { itemStyle: { shadowBlur: 10 } }
      }
    ]
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="访问量分析">
            <ReactECharts option={barChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="数据占比">
            <ReactECharts option={pieChartOption} style={{ height: 300 }} />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="用户趋势">
            <ReactECharts option={lineChartOption} style={{ height: 300 }} />
          </Card>
        </Col>

        <Col span={24}>
          <HasPermission code="dashboard:heatmap" noMatch={<Card title="行为热力图"><p>您无权限查看此内容</p></Card>}>
            <Card title="用户行为热力图（仅管理员）">
              <ReactECharts option={heatMapOption} style={{ height: 400 }} />
            </Card>
          </HasPermission>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
