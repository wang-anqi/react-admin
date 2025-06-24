// src/components/BarChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart as EBarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Spin } from 'antd';

// 注册必须的组件
echarts.use([
  EBarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer
]);

interface BarData {
  xAxisData: string[];
  seriesData: number[];
}

const BarChart: React.FC<{ data: BarData; loading?: boolean }> = ({ data, loading }) => {
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
      title: { text: '日访问量', left: 'center' },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} 次'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.xAxisData,
        axisLabel: {
          interval: 0,
          rotate: data.xAxisData.length > 7 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        name: '访问量'
      },
      series: [{
        name: '访问量',
        type: 'bar',
        data: data.seriesData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
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

export default BarChart;