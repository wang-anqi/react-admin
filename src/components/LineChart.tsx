import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as echarts from 'echarts';

interface LineChartProps {
  data: Array<{
    name: string;
    data: Array<{
      date: string;
      value: number;
    }>;
  }>;
  loading?: boolean;
  height?: number;
}

// 定义暴露给父组件的方法接口
export interface ChartRef {
  getChartInstance: () => echarts.ECharts | null;
}

// 组件同时支持有ref和无ref的使用方式
const LineChart = forwardRef<ChartRef | undefined, LineChartProps>(({ 
  data, 
  loading = false, 
  height = 400 
}, ref) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 暴露图表实例给父组件
  useImperativeHandle(ref, () => ({
    getChartInstance: () => chartInstance.current,
  }), []);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);

    // 监听窗口大小变化
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current || !data || data.length === 0) return;

    // 配置图表选项
    const option = {
      title: {
        text: '趋势分析',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: data.map(series => series.name),
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data[0]?.data.map(item => item.date.slice(5)) || []
      },
      yAxis: {
        type: 'value'
      },
      series: data.map((series, index) => ({
        name: series.name,
        type: 'line',
        data: series.data.map(item => item.value),
        smooth: true,
        itemStyle: {
          color: ['#1890ff', '#52c41a', '#faad14', '#f5222d'][index % 4]
        }
      }))
    };

    chartInstance.current.setOption(option, true);
  }, [data]);

  // 处理加载状态
  useEffect(() => {
    if (!chartInstance.current) return;

    if (loading) {
      chartInstance.current.showLoading();
    } else {
      chartInstance.current.hideLoading();
    }
  }, [loading]);

  return (
    <div 
      ref={chartRef} 
      style={{ 
        width: '100%', 
        height: `${height}px`
      }} 
    />
  );
});

LineChart.displayName = 'LineChart';

export default LineChart;
