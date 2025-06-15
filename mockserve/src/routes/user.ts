import express from 'express';

const router = express.Router();

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
export default router;

// import express from 'express';
// import { authMiddleware } from '../middleware/authMiddleware';

// const router = express.Router();

// router.get('/', authMiddleware, (req, res) => {
//   res.json({
//     code: 200,
//     data: [
//       { id: 1, username: 'admin', role: 'admin' },
//       { id: 2, username: 'manager', role: 'manage' },
//       { id: 3, username: 'user', role: 'user' },
//     ],
//   });
// });

// export default router;

