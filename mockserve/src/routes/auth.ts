// import express,{Request,Response} from 'express';

// const router = express.Router();

// interface User {
//     username: string;
//     password: string;
//     role: 'admin' | 'manage' | 'user';
//   }
  
//   const users: User[] = [
//     { username: 'admin', password: 'admin', role: 'admin' },
//     { username: 'manager', password: 'manager', role: 'manage' },
//     { username: 'user', password: 'user', role: 'user' },
//     { username: 'test', password: '123456', role: 'user' }, // 测试账号
//   ];

  
//   router.post('/login', (req:Request, res:Response) => {
//     console.log('收到登录请求:', req.body);

//     const { username, password } = req.body as {
//         username:string,
//         password:string
//     };
  
//     const user = users.find(
//       (u) => u.username === username && u.password === password
//     );
  
//     if (user) {
//       res.json({
//         code: 200,
//         token: `mock-${user.role}-token`,
//         role: user.role,
//       });
//     } else {
//       res.status(401).json({
//         code: 401,
//         message: 'Invalid username or password',
//       });
//     }
//   });

//   // 获取当前用户信息
// router.get('/me', (req: Request, res: Response) => {
//     const auth = req.headers.authorization;
//     const token = auth?.split(' ')[1];
  
//     const map: Record<string, { username: string; role: User['role'] }> = {
//       'mock-admin-token': { username: 'admin', role: 'admin' },
//       'mock-manage-token': { username: 'manager', role: 'manage' },
//       'mock-user-token': { username: 'user', role: 'user' },
//     };
  
//     const user = token ? map[token] : undefined;
  
//     if (user) {
//       res.json(user);
//     } else {
//       res.status(401).json({ message: 'Invalid token' });
//     }
//   });
  
  

// export default router;

// routes/auth.ts
import express, { Request, Response } from 'express';

const router = express.Router();

// 用户类型定义
interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  permissions: string[];
}

const users: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    role: 'admin',
    permissions: ['user:add', 'user:edit', 'user:delete'],
  },
  {
    id: 2,
    username: 'manager',
    password: 'manager',
    role: 'manage',
    permissions: ['user:add'],
  },
  {
    id: 3,
    username: 'user',
    password: 'user',
    role: 'user',
    permissions: [],
  },
];

// 登录接口
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({
      token: `mock-${user.role}-token`,
      role: user.role,
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// 获取当前用户信息
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  const tokenMap: Record<string, User> = {
    'mock-admin-token': users[0],
    'mock-manage-token': users[1],
    'mock-user-token': users[2],
  };

  const user = token ? tokenMap[token] : undefined;

  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;

