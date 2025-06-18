# React Admin 管理后台项目

本项目基于 React、TypeScript 和 Vite 构建，适合作为中后台管理系统的基础模板。项目结构清晰，便于扩展和维护，支持模块化开发和热更新。

## 项目功能简介

- 基于 React + TypeScript，类型安全
- 使用 Vite 作为构建工具，启动快、热更新流畅
-

## 目录结构说明

```
src/
├── App.tsx           // 应用主入口，路由与全局布局
├── main.tsx          // 入口文件，挂载 React 应用
├── index.css         // 全局样式
├── App.css           // App 组件样式
├── assets/           // 静态资源（图片、图标等）
├── components/       // 公共组件
├── pages/            // 页面模块（如登录页、仪表盘等）
├── services/         // 接口请求与服务层
├── store/            // 状态管理（如 Redux）
├── types/            // TypeScript 类型定义
├── utils/            // 工具函数
└── vite-env.d.ts     // Vite 环境类型声明
```

## 项目运行步骤

1. **安装依赖**

   请确保已安装 Node.js（建议 v18.20.7）。

   ```bash
   yarn install
   ```

2. **本地开发启动**

   ```bash
   yarn dev
   ```

   启动后访问终端输出的本地地址（如 http://localhost:5173）。

3. **打包构建**

   ```bash
   npm run build
   # 或
   yarn build
   ```

   构建产物会输出到 dist 目录。

4. **预览构建结果**

   ```bash
   npm run preview
   # 或
   yarn preview
   ```
## 接口数据设计
1. **数据设计**
```js
export interface User {
  id: string; // e.g. "admin-001"
  username: string;
  email: string;
  password: string;
  role: string; // 引用 roles.name
  status: 'active' | 'inactive';
  createdAt: string;
  token?:string;

}
export interface Role {
  id: number;
  name: string; // e.g. 'admin', 'managerBoss'
  description: string;
  permissions: string[];
}

// 数据库结构定义
export interface Database {
  userslist: User[];
  roles: Role[];
}
```
permissions 字段由后端根据角色动态附加，不写死在用户上。

2. **用户列表接口定义**
```js
export interface UsersList {
  id: string;
  username: string;
  email?: string;
  role: string
}
```

3. **/me用户个人信息 接口数据**
- 需要permission，借助roles来获取
- 前端页面的路由权限和页面权限都是通过redux数据控制的，也就是这个接口的返回数据，所有这个接口的返回数据的结构和redux数据获取要保持一致
- 接口权限 和 角色权限保持一致
```js
   function getPermissionsByRole(roleName: string) {
      const roles = db.data.roles.flat?.() || [];
      const role = roles.find((r: any) => r.name === roleName);
      return role?.permissions ?? [];
    }
    ···
    const permissions = getPermissionsByRole(user.role);
    return res.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        id: user.id,
        username: user.username,
        role: user.role ?? 'user',
        permissions,

      }
    });
```
#### 3-1 接口权限 和 角色权限保持一致
- 接口通过 实现，例如：用户列表的编辑和删除 只有admin拥有，则通过 middleware/auth/requireAdmin  实现
```js
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: '未认证用户'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: '权限不足，需要管理员权限'
    });
    return;
  }

  next();
}
```
接口调用
```js
router.delete('/deleteuser/:id', requireAdmin, async (req: Request<{ id: string }>, res: Response<ApiResponse>) => {
  ···
})
```

## 其他说明

- 推荐使用 VSCode 编辑器，并安装相关 TypeScript/ESLint 插件以获得更好的开发体验。
- 
- 

---




