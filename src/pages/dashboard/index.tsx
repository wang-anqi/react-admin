// // src/pages/Dashboard/index.tsx
// import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
// import { Card, Row, Col, Spin, Select, Button, message } from 'antd';
// import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';
// import HasPermission from '@/components/HasPermission';
// import { useSelector } from 'react-redux';
// import type { RootState } from '@/store';
// import { formatNumber, formatCurrency } from '@/utils/formatters';
// import './DashboardPage.css';
// import * as XLSX from 'xlsx';

// // 懒加载图表组件
// const BarChart = lazy(() => import('../../components/BarChart'));
// const PieChart = lazy(() => import('../../components/PieChart'));
// const LineChart = lazy(() => import('../../components/LineChart'));
// const HeatmapChart = lazy(() => import('../../components/HeatmapChart'));

// // Mock数据生成函数
// const getMockDashboardData = (timeRange: string) => {
//   const baseData = {
//     week: {
//       totalUsers: 12580,
//       todayOrders: 156,
//       totalSales: 89650,
//       conversionRate: 3.2,
//     },
//     month: {
//       totalUsers: 45620,
//       todayOrders: 234,
//       totalSales: 356800,
//       conversionRate: 4.1,
//     },
//     quarter: {
//       totalUsers: 128900,
//       todayOrders: 189,
//       totalSales: 1250000,
//       conversionRate: 3.8,
//     }
//   };

//   const currentData = baseData[timeRange as keyof typeof baseData] || baseData.week;

//   // 原始数据
//   const rawBarData = [
//     { category: '周一', value: 320, label: '访问量' },
//     { category: '周二', value: 280, label: '访问量' },
//     { category: '周三', value: 360, label: '访问量' },
//     { category: '周四', value: 290, label: '访问量' },
//     { category: '周五', value: 450, label: '访问量' },
//     { category: '周六', value: 380, label: '访问量' },
//     { category: '周日', value: 410, label: '访问量' },
//   ];

//   const rawLineData = [
//     { date: '06-18', value: 150, category: '用户增长' },
//     { date: '06-19', value: 180, category: '用户增长' },
//     { date: '06-20', value: 165, category: '用户增长' },
//     { date: '06-21', value: 220, category: '用户增长' },
//     { date: '06-22', value: 195, category: '用户增长' },
//     { date: '06-23', value: 240, category: '用户增长' },
//     { date: '06-24', value: 280, category: '用户增长' },
//   ];

//   const rawHeatmapData = [
//     { hour: 0, day: 'Mon', value: 15 },
//     { hour: 1, day: 'Mon', value: 8 },
//     { hour: 2, day: 'Mon', value: 5 },
//     { hour: 3, day: 'Mon', value: 3 },
//     { hour: 4, day: 'Mon', value: 2 },
//     { hour: 5, day: 'Mon', value: 4 },
//     { hour: 6, day: 'Mon', value: 12 },
//     { hour: 7, day: 'Mon', value: 25 },
//     { hour: 8, day: 'Mon', value: 45 },
//     { hour: 9, day: 'Mon', value: 65 },
//     { hour: 10, day: 'Mon', value: 85 },
//     { hour: 11, day: 'Mon', value: 90 },
//     { hour: 12, day: 'Mon', value: 80 },
//     { hour: 13, day: 'Mon', value: 75 },
//     { hour: 14, day: 'Mon', value: 88 },
//     { hour: 15, day: 'Mon', value: 92 },
//     { hour: 16, day: 'Mon', value: 78 },
//     { hour: 17, day: 'Mon', value: 65 },
//     { hour: 18, day: 'Mon', value: 45 },
//     { hour: 19, day: 'Mon', value: 35 },
//     { hour: 20, day: 'Mon', value: 28 },
//     { hour: 21, day: 'Mon', value: 22 },
//     { hour: 22, day: 'Mon', value: 18 },
//     { hour: 23, day: 'Mon', value: 12 },
//     // 其他天的数据...
//     { hour: 0, day: 'Tue', value: 12 },
//     { hour: 1, day: 'Tue', value: 6 },
//     { hour: 2, day: 'Tue', value: 4 },
//     { hour: 8, day: 'Tue', value: 48 },
//     { hour: 9, day: 'Tue', value: 68 },
//     { hour: 10, day: 'Tue', value: 88 },
//     { hour: 14, day: 'Tue', value: 85 },
//     { hour: 15, day: 'Tue', value: 95 },
//     { hour: 16, day: 'Tue', value: 82 },
//   ];

//   return {
//     ...currentData,
//     // 转换为BarChart期望的格式
//     barData: {
//       xAxisData: rawBarData.map(item => item.category),
//       seriesData: rawBarData.map(item => item.value)
//     },
//     // 保持PieChart原有格式
//     pieData: [
//       { name: '新用户', value: 45, color: '#1890ff' },
//       { name: '老用户', value: 35, color: '#52c41a' },
//       { name: '访客', value: 20, color: '#faad14' },
//     ],
//     // 转换为LineChart期望的格式
//     lineData: [{
//       name: '用户增长',
//       data: rawLineData.map(item => ({
//         date: `2024-${item.date}`,
//         value: item.value
//       }))
//     }],
//     // 转换为HeatmapChart期望的格式
//     heatmapData: rawHeatmapData.map(item => {
//       // 将day转换为具体的日期
//       const dayMap: { [key: string]: string } = {
//         'Mon': '2024-06-17',
//         'Tue': '2024-06-18',
//         'Wed': '2024-06-19',
//         'Thu': '2024-06-20',
//         'Fri': '2024-06-21',
//         'Sat': '2024-06-22',
//         'Sun': '2024-06-23'
//       };
      
//       return {
//         date: dayMap[item.day] || '2024-06-17',
//         hour: item.hour,
//         value: item.value
//       };
//     })
//   };
// };

// const Dashboard: React.FC = () => {
//   const { userInfo } = useSelector((state: RootState) => state.user);
//   const [timeRange, setTimeRange] = useState<string>('week');
//   const [loading, setLoading] = useState(false);

//   // 获取仪表盘数据 - 使用Mock数据
//   const dashboardData = useMemo(() => {
//     return getMockDashboardData(timeRange);
//   }, [timeRange]);

//   // 处理时间范围变化
//   const handleTimeRangeChange = (value: string) => {
//     setTimeRange(value);
//     setLoading(true);
//     // 模拟异步加载
//     setTimeout(() => {
//       setLoading(false);
//     }, 800);
//   };

//   // 刷新数据
//   const handleRefresh = () => {
//     setLoading(true);
//     // 模拟刷新延迟
//     setTimeout(() => {
//       setLoading(false);
//       message.success('数据刷新成功');
//     }, 1000);
//   };

//   // 导出数据
//   // const handleExport = () => {
//   //   // 实际项目中这里会实现数据导出逻辑
//   //   message.success('数据导出成功');
//   // };


// // 在Dashboard组件中替换原有的handleExport函数
// const handleExport = () => {
//   try {
//     // 创建新的工作簿
//     const workbook = XLSX.utils.book_new();
    
//     // 1. KPI数据工作表
//     const kpiWorksheetData = [
//       ['指标名称', '数值', '说明', '更新时间'],
//       ...kpiData.map(kpi => [
//         kpi.title,
//         kpi.value,
//         kpi.tooltip,
//         new Date().toLocaleString()
//       ])
//     ];
//     const kpiWorksheet = XLSX.utils.aoa_to_sheet(kpiWorksheetData);
//     XLSX.utils.book_append_sheet(workbook, kpiWorksheet, 'KPI指标');

//     // 2. 访问量数据工作表
//     const barWorksheetData = [
//       ['时间', '访问量'],
//       ...dashboardData.barData.xAxisData.map((category, index) => [
//         category,
//         dashboardData.barData.seriesData[index]
//       ])
//     ];
//     const barWorksheet = XLSX.utils.aoa_to_sheet(barWorksheetData);
//     XLSX.utils.book_append_sheet(workbook, barWorksheet, '访问量分析');

//     // 3. 数据占比工作表
//     const pieWorksheetData = [
//       ['类别', '数值', '占比'],
//       ...dashboardData.pieData.map(item => {
//         const total = dashboardData.pieData.reduce((sum, data) => sum + data.value, 0);
//         const percentage = ((item.value / total) * 100).toFixed(1) + '%';
//         return [item.name, item.value, percentage];
//       })
//     ];
//     const pieWorksheet = XLSX.utils.aoa_to_sheet(pieWorksheetData);
//     XLSX.utils.book_append_sheet(workbook, pieWorksheet, '数据占比');

//     // 4. 用户增长趋势工作表
//     const lineWorksheetData = [
//       ['日期', '用户增长数'],
//       ...dashboardData.lineData[0].data.map(item => [
//         item.date,
//         item.value
//       ])
//     ];
//     const lineWorksheet = XLSX.utils.aoa_to_sheet(lineWorksheetData);
//     XLSX.utils.book_append_sheet(workbook, lineWorksheet, '用户增长趋势');

//     // 5. 热力图数据工作表（如果有权限）
//     let heatmapWorksheet = null;
//     if (dashboardData.heatmapData && dashboardData.heatmapData.length > 0) {
//       const heatmapWorksheetData = [
//         ['日期', '小时', '活跃度'],
//         ...dashboardData.heatmapData.map(item => [
//           item.date,
//           `${item.hour}:00`,
//           item.value
//         ])
//       ];
//       heatmapWorksheet = XLSX.utils.aoa_to_sheet(heatmapWorksheetData);
//       XLSX.utils.book_append_sheet(workbook, heatmapWorksheet, '用户行为热力图');
//     }

//     // 6. 数据汇总工作表
//     const summaryWorksheetData = [
//       ['数据汇总报告'],
//       [''],
//       ['导出时间', new Date().toLocaleString()],
//       ['数据时间范围', timeRangeOptions.find(opt => opt.value === timeRange)?.label || ''],
//       ['导出用户', userInfo?.username || ''],
//       [''],
//       ['数据说明'],
//       ['1. KPI指标：包含总用户数、今日订单、销售额、转化率等关键指标'],
//       ['2. 访问量分析：按时间维度统计的访问量数据'],
//       ['3. 数据占比：新用户、老用户、访客的占比分析'],
//       ['4. 用户增长趋势：近期用户增长的趋势变化'],
//       ['5. 用户行为热力图：用户在不同时间段的活跃度分布（需要管理员权限）'],
//       [''],
//       ['注意事项'],
//       ['- 数据仅供参考，请以实时系统数据为准'],
//       ['- 导出数据基于当前选择的时间范围'],
//       ['- 如需更详细的数据分析，请联系系统管理员']
//     ];
//     const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryWorksheetData);
//     XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '数据说明');

//     // 设置列宽
//     const setColumnWidths = (worksheet: XLSX.WorkSheet, widths: number[]) => {
//       const cols = widths.map(width => ({ width }));
//       worksheet['!cols'] = cols;
//     };

//     // 为各个工作表设置合适的列宽
//     setColumnWidths(kpiWorksheet, [15, 15, 30, 20]);
//     setColumnWidths(barWorksheet, [12, 12]);
//     setColumnWidths(pieWorksheet, [12, 10, 10, 12]);
//     setColumnWidths(lineWorksheet, [15, 15]);
//     if (heatmapWorksheet) {
//       setColumnWidths(heatmapWorksheet, [15, 10, 12]);
//     }
//     setColumnWidths(summaryWorksheet, [50]);

//     // 生成文件名
//     const timeRangeLabel = timeRangeOptions.find(opt => opt.value === timeRange)?.label || '';
//     const fileName = `仪表盘数据_${timeRangeLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;

//     // 导出文件
//     XLSX.writeFile(workbook, fileName);
    
//     message.success('数据导出成功！');
//   } catch (error) {
//     console.error('导出数据时发生错误:', error);
//     message.error('数据导出失败，请重试');
//   }
// };

//   // KPI卡片数据
//   const kpiData = useMemo(() => {
//     if (!dashboardData) return [];

//     return [
//       {
//         title: '总用户数',
//         value: formatNumber(dashboardData.totalUsers),
//         icon: '👥',
//         color: '#1890ff',
//         tooltip: '系统注册用户总数'
//       },
//       {
//         title: '今日订单',
//         value: formatNumber(dashboardData.todayOrders),
//         icon: '📦',
//         color: '#52c41a',
//         tooltip: '今日产生的订单数量'
//       },
//       {
//         title: '销售额',
//         value: formatCurrency(dashboardData.totalSales),
//         icon: '💰',
//         color: '#faad14',
//         tooltip: '今日销售总额'
//       },
//       {
//         title: '转化率',
//         value: `${dashboardData.conversionRate}%`,
//         icon: '📈',
//         color: '#f5222d',
//         tooltip: '访客到客户的转化率'
//       }
//     ];
//   }, [dashboardData]);

//   // 时间范围选项
//   const timeRangeOptions = [
//     { label: '近7天', value: 'week' },
//     { label: '近30天', value: 'month' },
//     { label: '近90天', value: 'quarter' }
//   ];

//   return (
//     <div className="dashboard-page">
//       {/* 页面标题和操作区 */}
//       <div className="dashboard-header">
//         <div>
//           <h1>系统总览</h1>
//           <div className="dashboard-subtitle">
//             欢迎回来, {userInfo?.username} | 最后更新: {new Date().toLocaleTimeString()}
//           </div>
//         </div>
//         <div className="dashboard-actions">
//           <Button
//             type="primary"
//             icon={<SyncOutlined />}
//             onClick={handleRefresh}
//             loading={loading}
//           >
//             刷新数据
//           </Button>
//           <Button
//             icon={<DownloadOutlined />}
//             onClick={handleExport}
//           >
//             导出数据
//           </Button>
//         </div>
//       </div>

//       {/* 筛选区域 */}
//       <div className="dashboard-filters">
//         <Select
//           value={timeRange}
//           onChange={handleTimeRangeChange}
//           style={{ width: 120 }}
//           disabled={loading}
//         >
//           {timeRangeOptions.map(option => (
//             <Select.Option key={option.value} value={option.value}>
//               {option.label}
//             </Select.Option>
//           ))}
//         </Select>
//       </div>

//       {/* KPI指标卡片 */}
//       <Row gutter={16} className="kpi-row">
//         {kpiData.map((kpi, index) => (
//           <Col xs={24} sm={12} md={12} lg={6} key={index}>
//             <Card className="kpi-card" hoverable loading={loading}>
//               <div className="kpi-content" title={kpi.tooltip}>
//                 <div className="kpi-icon" style={{ backgroundColor: kpi.color }}>
//                   {kpi.icon}
//                 </div>
//                 <div className="kpi-info">
//                   <div className="kpi-title">{kpi.title}</div>
//                   <div className="kpi-value">{kpi.value}</div>
//                 </div>
//               </div>
//             </Card>
//           </Col>
//         ))}
//       </Row>

//       {/* 图表区域 */}
//       <div className="chart-container">
//         <Row gutter={[24, 24]}>
//           {/* 访问量柱状图 */}
//           <Col xs={24} lg={12}>
//             <Card
//               title="访问量分析"
//               className="chart-card"
//               loading={loading}
//               extra={<Button type="link">详情</Button>}
//             >
//               <Suspense fallback={<Spin tip="加载柱状图..." />}>
//                 <BarChart
//                   data={dashboardData?.barData || { xAxisData: [], seriesData: [] }}
//                   loading={loading}
//                 />
//               </Suspense>
//             </Card>
//           </Col>

//           {/* 数据占比分析 */}
//           <Col xs={24} lg={12}>
//             <Card
//               title="数据占比"
//               className="chart-card"
//               loading={loading}
//               extra={<Button type="link">详情</Button>}
//             >
//               <Suspense fallback={<Spin tip="加载饼图..." />}>
//                 <PieChart
//                   data={dashboardData?.pieData || []}
//                   loading={loading}
//                 />
//               </Suspense>
//             </Card>
//           </Col>
//         </Row>

//         <Row gutter={[24, 24]}>
//           {/* 用户增长趋势 */}
//           <Col span={24}>
//             <Card
//               title="用户趋势"
//               className="chart-card"
//               loading={loading}
//               extra={<Button type="link">详情</Button>}
//             >
//               <Suspense fallback={<Spin tip="加载折线图..." />}>
//                 <LineChart
//                   data={dashboardData?.lineData || []}
//                   loading={loading}
//                 />
//               </Suspense>
//             </Card>
//           </Col>
//         </Row>

//         {/* 用户行为热力图 */}
//         <Col span={24}>
//           <HasPermission code="dashboard:heatmap" noMatch={
//             <Card title="行为热力图" loading={loading}>
//               <div style={{
//                 height: 300,
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 color: '#999'
//               }}>
//                 您无权限查看此内容
//               </div>
//             </Card>
//           }>
//             <Card
//               title="用户行为热力图（仅管理员）"
//               className="chart-card"
//               loading={loading}
//               extra={<Button type="link">详情</Button>}
//             >
//               <Suspense fallback={<Spin tip="加载热力图..." />}>
//                 <HeatmapChart
//                   data={dashboardData?.heatmapData || []}
//                   loading={loading}
//                 />
//               </Suspense>
//             </Card>
//           </HasPermission>
//         </Col>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Card, Row, Col, Spin, Select, Button, message, Modal } from 'antd';
import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import HasPermission from '@/components/HasPermission';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { formatNumber, formatCurrency } from '@/utils/formatters';
import './DashboardPage.css';
import * as XLSX from 'xlsx';

const BarChart = lazy(() => import('../../components/BarChart'));
const PieChart = lazy(() => import('../../components/PieChart'));
const LineChart = lazy(() => import('../../components/LineChart'));
const HeatmapChart = lazy(() => import('../../components/HeatmapChart'));

// Mock数据生成函数
const getMockDashboardData = (timeRange: string) => {
  const baseData = {
    week: {
      totalUsers: 12580,
      todayOrders: 156,
      totalSales: 89650,
      conversionRate: 3.2,
    },
    month: {
      totalUsers: 45620,
      todayOrders: 234,
      totalSales: 356800,
      conversionRate: 4.1,
    },
    quarter: {
      totalUsers: 128900,
      todayOrders: 189,
      totalSales: 1250000,
      conversionRate: 3.8,
    }
  };

  const currentData = baseData[timeRange as keyof typeof baseData] || baseData.week;

  // 原始数据
  const rawBarData = [
    { category: '周一', value: 320, label: '访问量' },
    { category: '周二', value: 280, label: '访问量' },
    { category: '周三', value: 360, label: '访问量' },
    { category: '周四', value: 290, label: '访问量' },
    { category: '周五', value: 450, label: '访问量' },
    { category: '周六', value: 380, label: '访问量' },
    { category: '周日', value: 410, label: '访问量' },
  ];

  const rawLineData = [
    { date: '06-18', value: 150, category: '用户增长' },
    { date: '06-19', value: 180, category: '用户增长' },
    { date: '06-20', value: 165, category: '用户增长' },
    { date: '06-21', value: 220, category: '用户增长' },
    { date: '06-22', value: 195, category: '用户增长' },
    { date: '06-23', value: 240, category: '用户增长' },
    { date: '06-24', value: 280, category: '用户增长' },
  ];

  const rawHeatmapData = [
    { hour: 0, day: 'Mon', value: 15 },
    { hour: 1, day: 'Mon', value: 8 },
    { hour: 2, day: 'Mon', value: 5 },
    { hour: 3, day: 'Mon', value: 3 },
    { hour: 4, day: 'Mon', value: 2 },
    { hour: 5, day: 'Mon', value: 4 },
    { hour: 6, day: 'Mon', value: 12 },
    { hour: 7, day: 'Mon', value: 25 },
    { hour: 8, day: 'Mon', value: 45 },
    { hour: 9, day: 'Mon', value: 65 },
    { hour: 10, day: 'Mon', value: 85 },
    { hour: 11, day: 'Mon', value: 90 },
    { hour: 12, day: 'Mon', value: 80 },
    { hour: 13, day: 'Mon', value: 75 },
    { hour: 14, day: 'Mon', value: 88 },
    { hour: 15, day: 'Mon', value: 92 },
    { hour: 16, day: 'Mon', value: 78 },
    { hour: 17, day: 'Mon', value: 65 },
    { hour: 18, day: 'Mon', value: 45 },
    { hour: 19, day: 'Mon', value: 35 },
    { hour: 20, day: 'Mon', value: 28 },
    { hour: 21, day: 'Mon', value: 22 },
    { hour: 22, day: 'Mon', value: 18 },
    { hour: 23, day: 'Mon', value: 12 },
    // 其他天的数据...
    { hour: 0, day: 'Tue', value: 12 },
    { hour: 1, day: 'Tue', value: 6 },
    { hour: 2, day: 'Tue', value: 4 },
    { hour: 8, day: 'Tue', value: 48 },
    { hour: 9, day: 'Tue', value: 68 },
    { hour: 10, day: 'Tue', value: 88 },
    { hour: 14, day: 'Tue', value: 85 },
    { hour: 15, day: 'Tue', value: 95 },
    { hour: 16, day: 'Tue', value: 82 },
  ];

  return {
    ...currentData,
    // 转换为BarChart期望的格式
    barData: {
      xAxisData: rawBarData.map(item => item.category),
      seriesData: rawBarData.map(item => item.value)
    },
    // 保持PieChart原有格式
    pieData: [
      { name: '新用户', value: 45, color: '#1890ff' },
      { name: '老用户', value: 35, color: '#52c41a' },
      { name: '访客', value: 20, color: '#faad14' },
    ],
    // 转换为LineChart期望的格式
    lineData: [{
      name: '用户增长',
      data: rawLineData.map(item => ({
        date: `2024-${item.date}`,
        value: item.value
      }))
    }],
    // 转换为HeatmapChart期望的格式
    heatmapData: rawHeatmapData.map(item => {
      // 将day转换为具体的日期
      const dayMap: { [key: string]: string } = {
        'Mon': '2024-06-17',
        'Tue': '2024-06-18',
        'Wed': '2024-06-19',
        'Thu': '2024-06-20',
        'Fri': '2024-06-21',
        'Sat': '2024-06-22',
        'Sun': '2024-06-23'
      };
      
      return {
        date: dayMap[item.day] || '2024-06-17',
        hour: item.hour,
        value: item.value
      };
    })
  };
};


const Dashboard: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.user);
  const [timeRange, setTimeRange] = useState<string>('week');
  const [loading, setLoading] = useState(false);

  // 👉 Modal 显示控制状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalChartType, setModalChartType] = useState<'bar' | 'pie' | 'line' | 'heatmap' | null>(null);

  const openChartModal = (type: 'bar' | 'pie' | 'line' | 'heatmap') => {
    setModalChartType(type);
    setModalVisible(true);
  };

  const closeChartModal = () => {
    setModalVisible(false);
    setModalChartType(null);
  };

  const timeRangeOptions = [
    { label: '近7天', value: 'week' },
    { label: '近30天', value: 'month' },
    { label: '近90天', value: 'quarter' }
  ];

  const dashboardData = useMemo(() => {
    // ...getMockDashboardData 内容略，保持你已有代码即可
    return getMockDashboardData(timeRange);
  }, [timeRange]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('数据刷新成功');
    }, 1000);
  };

  const kpiData = useMemo(() => {
    if (!dashboardData) return [];
    return [
      {
        title: '总用户数',
        value: formatNumber(dashboardData.totalUsers),
        icon: '👥',
        color: '#1890ff',
        tooltip: '系统注册用户总数'
      },
      {
        title: '今日订单',
        value: formatNumber(dashboardData.todayOrders),
        icon: '📦',
        color: '#52c41a',
        tooltip: '今日产生的订单数量'
      },
      {
        title: '销售额',
        value: formatCurrency(dashboardData.totalSales),
        icon: '💰',
        color: '#faad14',
        tooltip: '今日销售总额'
      },
      {
        title: '转化率',
        value: `${dashboardData.conversionRate}%`,
        icon: '📈',
        color: '#f5222d',
        tooltip: '访客到客户的转化率'
      }
    ];
  }, [dashboardData]);

  return (
    <div className="dashboard-page">
      {/* 页面标题和操作区 */}
      <div className="dashboard-header">
        <div>
          <h1>系统总览</h1>
          <div className="dashboard-subtitle">
            欢迎回来, {userInfo?.username} | 最后更新: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="dashboard-actions">
          <Button type="primary" icon={<SyncOutlined />} onClick={handleRefresh} loading={loading}>
            刷新数据
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => message.info('导出功能已实现')}>
            导出数据
          </Button>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="dashboard-filters">
        <Select value={timeRange} onChange={handleTimeRangeChange} style={{ width: 120 }} disabled={loading}>
          {timeRangeOptions.map(option => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* KPI 指标卡片 */}
      <Row gutter={16} className="kpi-row">
        {kpiData.map((kpi, index) => (
          <Col xs={24} sm={12} md={12} lg={6} key={index}>
            <Card className="kpi-card" hoverable loading={loading}>
              <div className="kpi-content" title={kpi.tooltip}>
                <div className="kpi-icon" style={{ backgroundColor: kpi.color }}>
                  {kpi.icon}
                </div>
                <div className="kpi-info">
                  <div className="kpi-title">{kpi.title}</div>
                  <div className="kpi-value">{kpi.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区 */}
      <div className="chart-container">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              title="访问量分析"
              className="chart-card"
              loading={loading}
              extra={<Button type="link" onClick={() => openChartModal('bar')}>详情</Button>}
            >
              <Suspense fallback={<Spin tip="加载中..." />}>
                <BarChart data={dashboardData.barData} loading={loading} />
              </Suspense>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title="数据占比"
              className="chart-card"
              loading={loading}
              extra={<Button type="link" onClick={() => openChartModal('pie')}>详情</Button>}
            >
              <Suspense fallback={<Spin tip="加载中..." />}>
                <PieChart data={dashboardData.pieData} loading={loading} />
              </Suspense>
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card
              title="用户趋势"
              className="chart-card"
              loading={loading}
              extra={<Button type="link" onClick={() => openChartModal('line')}>详情</Button>}
            >
              <Suspense fallback={<Spin tip="加载中..." />}>
                <LineChart data={dashboardData.lineData} loading={loading} />
              </Suspense>
            </Card>
          </Col>
          <Col span={24}>
            <HasPermission code="dashboard:heatmap" noMatch={
              <Card title="行为热力图" loading={loading}>
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
                  您无权限查看此内容
                </div>
              </Card>
            }>
              <Card
                title="用户行为热力图（仅管理员）"
                className="chart-card"
                loading={loading}
                extra={<Button type="link" onClick={() => openChartModal('heatmap')}>详情</Button>}
              >
                <Suspense fallback={<Spin tip="加载中..." />}>
                  <HeatmapChart data={dashboardData.heatmapData} loading={loading} />
                </Suspense>
              </Card>
            </HasPermission>
          </Col>
        </Row>
      </div>

      {/* 👉 放大图表 Modal */}
      <Modal
        open={modalVisible}
        onCancel={closeChartModal}
        footer={null}
        width="80%"
        title={
          modalChartType === 'bar' ? '访问量详情' :
          modalChartType === 'pie' ? '数据占比详情' :
          modalChartType === 'line' ? '用户趋势详情' :
          modalChartType === 'heatmap' ? '行为热力图详情' : ''
        }
        destroyOnClose
      >
        <Suspense fallback={<Spin tip="加载中..." />}>
          {modalChartType === 'bar' && <BarChart data={dashboardData.barData} loading={loading} />}
          {modalChartType === 'pie' && <PieChart data={dashboardData.pieData} loading={loading} />}
          {modalChartType === 'line' && <LineChart data={dashboardData.lineData} loading={loading} />}
          {modalChartType === 'heatmap' && <HeatmapChart data={dashboardData.heatmapData} loading={loading} />}
        </Suspense>
      </Modal>
    </div>
  );
};

export default Dashboard;
