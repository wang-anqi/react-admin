// src/pages/Dashboard/components/PieChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { PieChart as EPieChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Spin } from 'antd';

// 注册必须的组件
echarts.use([
  EPieChart,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer
]);

interface PieData {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieData[];
  loading?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ data, loading }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);
    
    // 清理函数
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current || loading) return;
    
    const option = {
      title: { 
        text: '数据占比分析',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map(item => item.name)
      },
      series: [{
        name: '占比',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }]
    };

    chartInstance.current.setOption(option);
    
    // 响应式调整
    const resizeHandler = () => chartInstance.current?.resize();
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [data, loading]);

  if (loading) {
    return (
      <div style={{ 
        height: 300, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Spin tip="加载数据..." />
      </div>
    );
  }

  return <div ref={chartRef} style={{ height: 300, width: '100%' }} />;
};

export default PieChart;