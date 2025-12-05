本页面全面概述了 rustPac\_photowall 项目的架构。

## 架构概述

![](../assets/2025-12-03-11.png)

## 目录结构

### 根目录层级

```
rustPac_photowall/
├── backend/           ├── frontend/          # React 应用  
├── package.json       # 根依赖
└── package-lock.json  # 根锁定文件
```

### 后端结构

后端采用 Rust 语言和 Actix Web 框架构建，提供稳健且高性能的 API 服务器。

```
backend/
├── Cargo.toml         # Rust 项目配置
├── Cargo.lock         # 依赖锁定文件
└── src/
    ├── main.rs        # 应用入口点
    ├── db.rs          # 数据库连接与操作
    ├── handlers.rs    # HTTP 请求处理器
    └── models.rs      # 数据结构与模型
```

**核心依赖**：

-   **actix-web**: 构建 HTTP 服务器的 Web 框架
-   **sqlx**: 数据库操作的异步 SQL 工具包
-   **actix-cors**: 处理跨域请求的 CORS 中间件
-   **actix-multipart**: 文件上传处理
-   **tokio**: 异步运行时

### 前端结构

前端是基于 Vite 构建的现代化 React 应用，支持快速开发和构建。

```
frontend/
├── package.json       # Node.js 项目配置
├── vite.config.js     # Vite 构建配置
├── index.html         # HTML 入口点
├── eslint.config.js   # ESLint 配置
└── src/
    ├── App.jsx        # 主应用组件
    ├── App.css        # 应用样式
    ├── main.jsx       # React 入口点
    ├── index.css      # 全局样式
    └── assets/        # 静态资源
```

**核心依赖**：

-   **react**: 构建组件的 UI 库
-   **axios**: API 通信的 HTTP 客户端
-   **vite**: 构建工具和开发服务器

## 组件职责

### 后端组件

| 组件 | 用途 | 核心功能 |
| --- | --- | --- |
| **main.rs** | 服务器初始化 | HTTP 服务器搭建、CORS 配置、中间件 |
| **handlers.rs** | API 端点逻辑 | 照片上传、获取、文件处理 |
| **db.rs** | 数据库操作 | 连接池管理、查询执行 |
| **models.rs** | 数据结构 | 照片元数据、数据库模式 |

### 前端组件

| 组件 | 用途 | 核心功能 |
| --- | --- | --- |
| **App.jsx** | 主应用 | 照片画廊、上传界面、状态管理 |
| **main.jsx** | React 初始化 | DOM 挂载、应用启动 |

## 数据流架构

![](../assets/2025-12-03-12.png)

## 配置文件

### 环境配置

应用使用环境变量进行配置：

-   `DATABASE_URL`: MySQL 数据库连接字符串
-   `SERVER_HOST`: 服务器主机地址（默认：127.0.0.1）
-   `SERVER_PORT`: 服务器端口（默认：8080）
-   `UPLOAD_DIR`: 文件上传目录（默认：../uploads）

### 构建配置

-   **后端**: Rust 的 Cargo 系统管理编译和依赖
-   **前端**: Vite 提供快速开发服务器和优化构建

## 工作流

1.  **后端开发**: 进入 `backend/` 目录，使用 `cargo run` 启动 Rust 服务器
2.  **前端开发**: 进入 `frontend/` 目录，使用 `npm run dev` 启动 Vite 开发服务器
3.  **数据库设置**: 配置 MySQL 并设置 `DATABASE_URL` 环境变量

