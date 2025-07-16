# 登录功能使用说明

## 功能概述

前端已实现完整的用户登录和注册功能，包括：

- 用户注册
- 用户登录
- 用户状态管理
- 受保护的路由
- 导航栏用户状态显示

## 页面说明

### 1. 登录页面 (`/login`)
- 支持用户登录和注册
- 表单验证和错误提示
- 响应式设计

### 2. 个人资料页面 (`/profile`)
- 需要登录才能访问
- 显示用户信息
- 受保护的路由示例

### 3. 测试页面 (`/test-auth`)
- 用于测试登录状态
- 显示当前用户信息
- 提供登录/退出操作

## 组件说明

### UserContext (`/contexts/UserContext.tsx`)
- 管理全局用户状态
- 提供登录、退出功能
- 自动从localStorage恢复状态

### ProtectedRoute (`/components/common/ProtectedRoute.tsx`)
- 保护需要登录的页面
- 自动跳转到登录页面
- 显示加载状态

### Navbar (`/components/common/Navbar.tsx`)
- 显示用户登录状态
- 提供登录/退出按钮
- 响应式设计

## API 工具

### API 函数 (`/utils/api.ts`)
- `login()`: 用户登录
- `register()`: 用户注册
- `getAuthHeaders()`: 获取认证头

## 类型定义

### 用户类型 (`/types/user.ts`)
- `User`: 用户信息接口
- `LoginRequest`: 登录请求接口
- `RegisterRequest`: 注册请求接口
- `LoginResponse`: 登录响应接口

## 使用方法

### 1. 启动后端服务
确保后端服务在 `http://localhost:8080` 运行

### 2. 启动前端服务
```bash
cd short-trip-front
npm run dev
```

### 3. 测试登录功能
1. 访问 `http://localhost:3000/login`
2. 注册新用户或使用现有用户登录
3. 访问 `http://localhost:3000/test-auth` 查看登录状态
4. 访问 `http://localhost:3000/profile` 测试受保护的路由

## 测试用户

后端已预置测试用户：
- 用户名: `testuser`
- 密码: `password123`

## 注意事项

1. 确保后端CORS配置正确
2. 登录状态保存在localStorage中
3. 受保护的页面会自动跳转到登录页面
4. 导航栏会根据登录状态显示不同内容

## 扩展功能

可以基于现有登录系统扩展：
- 用户权限管理
- 个人资料编辑
- 密码重置
- 邮箱验证
- 第三方登录 