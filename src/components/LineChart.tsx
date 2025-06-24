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
      chartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current || loading) return;
    
    // 处理大数据集 - 采样
    const sampledData = data.map(series => {
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
        left: 'center'
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

export default LineChart;