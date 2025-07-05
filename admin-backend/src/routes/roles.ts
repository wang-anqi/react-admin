import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, generateId } from '../database/db.js';


import { Role } from '../types/index.js';

type RoleTreeItem = {
  title: string;
  key: string;
  children?: RoleTreeItem[];
};

// const result: RoleTreeItem[] = [
//   {
//     title: '管理员',
//     key: 'adminGroup',
//     children: []
//   },
//   {
//     title: '用户组',
//     key: 'userGroup',
//     children: []
//   }
// ];

const router = Router();
// 获取所有角色
router.get('/', (req: Request, res: Response) => {
    db.read();
    res.json({ code: 200, data: db.data?.roles || [] });
});

//  新增角色
router.post('/', (req: Request, res: Response) => {
    const { name, description, permissions } = req.body;
    console.log('roles接口新增角色',permissions);
    
  
    if (!name) {
      return res.status(400).json({ code: 400, message: '角色名称不能为空' });
    }
  
    db.read();
    const exists = db.data!.roles.find(role => role.name === name);
    if (exists) {
      return res.status(409).json({ code: 409, message: '角色名称已存在' });
    }
  
    const newRole: Role = {
      id: Date.now(),
      name,
      description: description || '',
      permissions: permissions || [],
    };
  
    db.data!.roles.push(newRole);
    db.write();
  
    res.json({ code: 200, data: newRole });
  });

  router.put('/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, description, permissions } = req.body;
  
    db.read();
    const role = db.data!.roles.find(role => role.id === id);
    if (!role) {
      return res.status(404).json({ code: 404, message: '角色不存在' });
    }
  
    role.name = name || role.name;
    role.description = description || role.description;
    role.permissions = permissions || [];
  
    db.write();
    res.json({ code: 200, data: role });
  });
  
  // 删除角色（有用户使用则不能删）
  router.delete('/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
  
    db.read();
    const role = db.data!.roles.find(role => role.id === id);
    if (!role) {
      return res.status(404).json({ code: 404, message: '角色不存在' });
    }
  
    const isUsed = db.data!.userslist?.some(user => user.role === role.name);
    if (isUsed) {
      return res.status(400).json({ code: 400, message: '有用户使用该角色，无法删除' });
    }
  
    db.data!.roles = db.data!.roles.filter(role => role.id !== id);
    db.write();
  
    res.json({ code: 200, message: '角色已删除' });
  });


  router.get('/rolesTree', async (req: Request, res: Response) => {
    await db.read();
    const roles = db.data?.roles || [];
  
    const result: RoleTreeItem[] = [
      {
        title: '管理员',
        key: 'adminGroup',
        children: []
      },
      {
        title: '用户组',
        key: 'userGroup',
        children: []
      }
    ];

        
  
    for (const role of roles) {
      const item = { title: role.description, key: role.name };

      const isManager =['admin', 'manager', 'managerBoss'].includes(role.name) || role.name.startsWith('manager_')
      const isUser = ['user','userBoss'].includes(role.name) || role.name.startsWith('user_')
      if (isManager) {
        result[0].children?.push(item);
      } else if (isUser) {
        result[1].children?.push(item);
      }
    }
  
    res.json({
      code: 200,
      data: result
    });
  });
  
  export default router;
