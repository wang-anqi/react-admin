// src/pages/Dashboard/components/LineChart.tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart as ELineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Spin } from 'antd';

// 注册必须的组件
echarts.use([
  ELineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer
]);

interface LineData {
  name: string;
  data: { date: string; value: number }[];
}

interface LineChartProps {
  data: LineData[];
  loading?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({ data, loading }) => {
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
    if (!data || !Array.isArray(data)) {
      console.warn('LineChart: 数据格式错误', data);
      return;
    }

    // 如果没有数据，显示空状态
    if (data.length === 0) {
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
    
    // 验证每个系列的数据结构
    const validData = data.filter(series => {
      return series && 
             typeof series.name === 'string' && 
             Array.isArray(series.data) && 
             series.data.length > 0;
    });

    if (validData.length === 0) {
      console.warn('LineChart: 没有有效的数据系列');
      return;
    }

    // 处理大数据集 - 采样
    const sampledData = validData.map(series => {
      if (series.data.length > 100) {
        const step = Math.ceil(series.data.length / 50);
        return {
          ...series,
          data: series.data.filter((_, i) => i % step === 0)
        };
      }
      return series;
    });
    
    const option = {
      title: { 
        text: '用户增长趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: sampledData.map(item => item.name),
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        name: '用户数'
      },
      series: sampledData.map(series => ({
        name: series.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3
        },
        emphasis: {
          focus: 'series'
        },
        data: series.data.map(item => [item.date, item.value])
      }))
    };

    try {
      chartInstance.current.setOption(option);
    } catch (error) {
      console.error('LineChart: 设置图表选项时出错', error);
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

export default LineChart;