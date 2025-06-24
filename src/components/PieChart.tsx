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
  color?: string;
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
      console.warn('PieChart: 数据格式错误', data);
      return;
    }

    // 过滤有效数据
    const validData = data.filter(item => {
      return item && 
             typeof item.name === 'string' && 
             typeof item.value === 'number' && 
             !isNaN(item.value) && 
             item.value >= 0;
    });

    // 如果没有有效数据，显示空状态
    if (validData.length === 0) {
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
        text: '数据占比分析',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: validData.map(item => item.name)
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
        data: validData.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: item.color ? {
            color: item.color
          } : undefined
        }))
      }]
    };

    try {
      chartInstance.current.setOption(option);
    } catch (error) {
      console.error('PieChart: 设置图表选项时出错', error);
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

export default PieChart;