// src/pages/Dashboard/components/HeatmapChart.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts/core';
import { HeatmapChart as EHeatmapChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    TitleComponent,
    VisualMapComponent,
    CalendarComponent,
    DatasetComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Spin } from 'antd';

// 注册必须的组件
echarts.use([
    EHeatmapChart,
    GridComponent,
    TooltipComponent,
    TitleComponent,
    VisualMapComponent,
    CalendarComponent,
    DatasetComponent,
    CanvasRenderer
]);

interface HeatmapData {
    date: string;
    hour: number;
    value: number;
}

interface HeatmapChartProps {
    data: HeatmapData[];
    loading?: boolean;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, loading }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);
    const resizeObserver = useRef<ResizeObserver | null>(null);

    // 初始化图表
    const initChart = useCallback(() => {
        if (!chartRef.current) return;

        // 如果已有实例，先销毁
        if (chartInstance.current) {
            chartInstance.current.dispose();
        }

        // 创建新的图表实例
        chartInstance.current = echarts.init(chartRef.current, null, {
            renderer: 'canvas',
            useDirtyRect: true // 启用脏矩形渲染优化
        });
    }, []);

    // 更新图表数据
    const updateChart = useCallback(() => {
        if (!chartInstance.current || loading) return;

        // 如果没有数据，显示空状态
        if (!data || data.length === 0) {
            chartInstance.current.setOption({
                title: {
                    text: '用户行为热力图',
                    left: 'center',
                    textStyle: {
                        color: '#999',
                        fontWeight: 'normal'
                    }
                },
                graphic: {
                    type: 'text',
                    left: 'center',
                    top: 'middle',
                    style: {
                        text: '暂无数据',
                        fontSize: 16,
                        fill: '#999'
                    }
                }
            });
            return;
        }

        // 确定日期范围
        const dates = Array.from(new Set(data.map(item => item.date)));
        const minDate = new Date(Math.min(...dates.map(d => new Date(d).getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => new Date(d).getTime())));

        // 处理大数据集 - 采样
        const maxPoints = 2000;
        let processedData = data;
        if (data.length > maxPoints) {
            const step = Math.ceil(data.length / maxPoints);
            processedData = data.filter((_, i) => i % step === 0);
        }

        // 转换数据格式
        const chartData = processedData.map(item => [
            item.date,
            item.hour,
            item.value
        ]);

        // 计算最大值和最小值
        const values = data.map(d => d.value);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);

        const option = {
            title: {
                text: '用户行为热力图',
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                position: 'top',
                formatter: (params: any) => {
                    const value = params.value[2];
                    const date = new Date(params.value[0]);
                    return `
            <div style="font-weight: bold; margin-bottom: 5px;">
              ${date.toLocaleDateString()} ${params.value[1]}:00
            </div>
            <div>
              活动量: <b style="color: #1890ff;">${value}</b>
            </div>
          `;
                },
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#eee',
                borderWidth: 1,
                padding: 10,
                textStyle: {
                    color: '#333'
                }
            },
            visualMap: {
                min: minValue,
                max: maxValue,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: 20,
                inRange: {
                    color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                },
                textStyle: {
                    color: '#666'
                }
            },
            calendar: {
                top: 50,
                left: 30,
                right: 30,
                cellSize: ['auto', 15],
                range: [minDate.toISOString().split('T')[0], maxDate.toISOString().split('T')[0]],
                itemStyle: {
                    borderWidth: 0.5,
                    borderColor: '#f0f0f0'
                },
                dayLabel: {
                    firstDay: 1,
                    nameMap: 'cn'
                },
                monthLabel: {
                    nameMap: 'cn'
                },
                yearLabel: {
                    show: false
                }
            },
            series: [{
                name: '用户活跃度',
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: chartData,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                progressive: 1000, // 渐进式渲染
                animation: true,
                animationThreshold: 500, // 数据量超过500时关闭动画
                animationDuration: 1000,
                animationEasing: 'cubicOut'
            }]
        };

        chartInstance.current.setOption(option);
    }, [data, loading]);

    // 响应式调整
    const handleResize = useCallback(() => {
        if (chartInstance.current) {
            chartInstance.current.resize();
        }
    }, []);

    // 初始化图表和事件监听
    useEffect(() => {
        initChart();

        // 监听容器大小变化
        if (chartRef.current) {
            resizeObserver.current = new ResizeObserver(handleResize);
            resizeObserver.current.observe(chartRef.current);
        }

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);

        return () => {
            if (resizeObserver.current && chartRef.current) {
                resizeObserver.current.unobserve(chartRef.current);
            }
            window.removeEventListener('resize', handleResize);

            // 销毁图表实例
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, [initChart, handleResize]);

    // 数据变化时更新图表
    useEffect(() => {
        updateChart();
    }, [updateChart]);

    // 处理加载状态
    if (loading) {
        return (
            <div style={{
                height: 400,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Spin tip="加载热力图数据..." size="large" />
            </div>
        );
    }

    return (
        <div
            ref={chartRef}
            style={{
                height: 400,
                width: '100%',
                minHeight: 300,
                backgroundColor: '#fff',
                borderRadius: 8
            }}
        />
    );
};

export default HeatmapChart;