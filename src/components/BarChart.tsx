import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from 'react';
import * as echarts from 'echarts/core';
import { BarChart as EBarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Spin } from 'antd';

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
  height?: number;
}
export interface ChartRef {
  getChartInstance: () => echarts.ECharts | null;
}


const BarChart = forwardRef<ChartRef, BarChartProps>(
  ({ data, loading = false, height = 300 }, ref) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useImperativeHandle(ref, () => ({
      getChartInstance: () => chartInstance.current
    }));

    useEffect(() => {
      if (!chartRef.current) return;
      chartInstance.current = echarts.init(chartRef.current);
      return () => {
        chartInstance.current?.dispose();
        chartInstance.current = null;
      };
    }, []);

    useEffect(() => {
      if (!chartInstance.current || loading) return;

      const { xAxisData = [], seriesData = [] } = data;
      if (xAxisData.length === 0 || seriesData.length === 0) {
        chartInstance.current.setOption({
          title: {
            text: '暂无数据',
            left: 'center',
            top: 'middle',
            textStyle: { fontSize: 16, color: '#999' }
          }
        });
        return;
      }

      const option = {
        title: {
          text: '日访问量',
          left: 'center',
          textStyle: { fontSize: 16, fontWeight: 'bold' }
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
        series: [
          {
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
          }
        ]
      };

      chartInstance.current.setOption(option);

      const resizeHandler = () => chartInstance.current?.resize();
      window.addEventListener('resize', resizeHandler);
      return () => {
        window.removeEventListener('resize', resizeHandler);
      };
    }, [data, loading]);

    if (loading) {
      return (
        <div style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin tip="加载数据..." />
        </div>
      );
    }

    return <div ref={chartRef} style={{ height, width: '100%' }} />;
  }
);

BarChart.displayName = 'BarChart';

export default BarChart;
