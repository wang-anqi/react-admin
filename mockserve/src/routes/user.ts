import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb';
import { nanoid } from '@reduxjs/toolkit';
export interface User {
  id: string;
  name: string;
  email: string;
}

type Data = {
  users: User[];
};

const router = express.Router();
const adapter = new JSONFile<Data>('db.json');
const db = new Low<Data>(adapter);
db.read();
db.data ||= { users: [] };

router.get('/', (req, res) => {
  res.json({
    code: 200,
    data: [
      { id: 1, username: 'admin', role: 'admin' },
      { id: 2, username: 'manager', role: 'manage' },
      { id: 3, username: 'user', role: 'user' },
    ],
  });
});


router.get('/usersList', (req, res) => {
  res.json({
    code: 200,
    data:  [
      { id: 1, username: 'admin', role: 'admin', email: 'admin@example.com' },
      { id: 2, username: 'manager', role: 'manage', email: 'manager@example.com' },
      { id: 3, username: 'user', role: 'user', email: 'user@example.com' },
    ],
  });
});
// POST /users
router.post('/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
     res.status(400).json({ message: 'Missing name or email' });
     return;
  }

  const newUser: User = {
    id: nanoid(),
    name,
    email,
  };

  db.data!.users.push(newUser);
  await db.write();

  res.status(201).json(newUser);
});





export default router;



