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

interface BarChartProps {
  data: BarData;
  loading?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ data, loading }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);
    
    // 清理函数
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current || loading) return;
    
    // 数据验证和处理
    if (!data || !data.xAxisData || !data.seriesData) {
      console.warn('BarChart: 数据格式错误', data);
      return;
    }

    // 确保数据数组存在且有内容
    const xAxisData = Array.isArray(data.xAxisData) ? data.xAxisData : [];
    const seriesData = Array.isArray(data.seriesData) ? data.seriesData : [];

    // 如果没有数据，显示空状态
    if (xAxisData.length === 0 || seriesData.length === 0) {
      const emptyOption = {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'middle',
          textStyle: {
            fontSize: 16,
            color: '#999'
          }
        }
      };
      chartInstance.current.setOption(emptyOption);
      return;
    }
    
    const option = {
      title: { 
        text: '日访问量', 
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
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
        data: xAxisData,
        axisLabel: {
          interval: 0,
          rotate: xAxisData.length > 7 ? 45 : 0
        }
      },
      yAxis: {
        type: 'value',
        name: '访问量'
      },
      series: [{
        name: '访问量',
        type: 'bar',
        data: seriesData,
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

    try {
      chartInstance.current.setOption(option);
    } catch (error) {
      console.error('BarChart: 设置图表选项时出错', error);
    }
    
    // 响应式调整
    const resizeHandler = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    
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