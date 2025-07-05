import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react';
import * as echarts from 'echarts';


interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  loading?: boolean;
  height?: number;
}
// 定义暴露给父组件的方法接口
export interface ChartRef {
  getChartInstance: () => echarts.ECharts | null;
}

const PieChart = forwardRef<ChartRef, PieChartProps>(
  ({ data, loading = false, height = 400 }, ref) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useImperativeHandle(ref, () => ({
      getChartInstance: () => chartInstance.current,
    }));

    useEffect(() => {
      if (!chartRef.current) return;
      chartInstance.current = echarts.init(chartRef.current);

      const handleResize = () => chartInstance.current?.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
        chartInstance.current = null;
      };
    }, []);

    useEffect(() => {
      if (!chartInstance.current || data.length === 0) return;

      const option = {
        title: {
          text: '结构占比',
          left: 'center',
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'center',
          data: data.map(item => item.name)
        },
        series: [
          {
            name: '占比',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            data: data.map(item => ({
              value: item.value,
              name: item.name,
              itemStyle: { color: item.color }
            }))
          }
        ]
      };

      chartInstance.current.setOption(option, true);
    }, [data]);

    useEffect(() => {
      if (!chartInstance.current) return;
      loading ? chartInstance.current.showLoading() : chartInstance.current.hideLoading();
    }, [loading]);

    return (
      <div ref={chartRef} style={{ width: '100%', height: `${height}px` }} />
    );
  }
);

PieChart.displayName = 'PieChart';
export default PieChart;
