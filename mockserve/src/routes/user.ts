// import express from 'express';

// const router = express.Router();

// router.get('/', (req, res) => {
//   res.json({
//     code: 200,
//     data: [
//       { id: 1, username: 'admin', role: 'admin' },
//       { id: 2, username: 'manager', role: 'manage' },
//       { id: 3, username: 'user', role: 'user' },
//     ],
//   });
// });


// router.get('/usersList', (req, res) => {
//   res.json({
//     code: 200,
//     data:  [
//       { id: 1, username: 'admin', role: 'admin', email: 'admin@example.com' },
//       { id: 2, username: 'manager', role: 'manage', email: 'manager@example.com' },
//       { id: 3, username: 'user', role: 'user', email: 'user@example.com' },
//     ],
//   });
// });
// export default router;
// routes/user.ts
import express, { Request, Response } from 'express';
import path from 'path';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';

type User = {
  id: number;
  username: string;
  email?: string;
  role: 'admin' | 'manage' | 'user';
};

type Data = {
  users: User[];
};

// 初始化数据库
const dbFile = path.resolve(__dirname, '../db.json');
const adapter = new JSONFileSync<Data>(dbFile);
const db = new LowSync<Data>(adapter, { defaultData: { users: [] } } as any);
db.read();

const router = express.Router();

// ✅ 获取用户列表
router.get('/usersList', (req: Request, res: Response) => {
  db.read();
  res.json({ code: 200, data: db.data!.users });
});




// ✅ 删除用户
// router.delete('/deleteUser/:id', (req: Request, res: Response) => {
//   const id = Number(req.params.id);

//   db.read();
//   const index = db.data!.users.findIndex(u => u.id === id);
//   if (index === -1) return res.status(404).json({ code: 404, message: '用户不存在' });

//   const deleted = db.data!.users.splice(index, 1)[0];
//   db.write();

//   res.json({ code: 200, data: deleted });
// });

export default router;



