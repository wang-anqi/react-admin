import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';

// 导入路由
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import rolesRoutes from './routes/roles'

// 导入数据库初始化
import { initDatabase } from './database/db';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // 默认允许 Vite 开发服务器
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles',rolesRoutes)

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `路由 ${req.originalUrl} 不存在`
  });
});

// 全局错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('全局错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
async function startServer() {
  try {
    // 确保数据目录存在
    const dataDir = join(__dirname, '../data');
    try {
      await mkdir(dataDir, { recursive: true });
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    // 初始化数据库
    await initDatabase();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(` 服务器运行在 http://localhost:${PORT}`);
      
      console.log(`   - 健康检查: GET /health`);
      console.log(`   - 登录: POST /api/auth/login`);
      console.log(`   - 登出: POST /api/auth/logout`);
      console.log(`   - 获取用户列表: GET /api/users/userslist`);
      console.log(`   - 新增用户: POST /api/users/adduser`);
      console.log(`   - 编辑用户: PUT /api/users/edituser/:id`);
      console.log(`   - 删除用户: DELETE /api/users/deleteuser/:id`);
      console.log(`   - 获取用户详情: GET /api/users/user/:id`);
      console.log(`\n 默认管理员账户:`);
      console.log(`   用户名: admin`);
      console.log(`   密码: admin123`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);
});

// 启动应用
startServer();