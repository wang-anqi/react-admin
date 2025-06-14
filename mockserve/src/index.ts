import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import usersRouter from './routes/user';
import authRouter from './routes/auth';
// import dashboardRouter from './routes/dashboard';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// 注册路由
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
// app.use('/api/dashboard', dashboardRouter);

const port = 5000;
app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
