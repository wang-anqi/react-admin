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

## 其他说明

- 推荐使用 VSCode 编辑器，并安装相关 TypeScript/ESLint 插件以获得更好的开发体验。
- 
- 

---




