photowall使用 Rust 和 React 构建照片墙应用。
该项目作为将 Rust 的性能和安全性与 React 的动态用户界面能力相结合的练手项目。

## 架构概述

应用程序采用清晰的客户端-服务器架构，各层职责分明：

![](../assets/2025-12-03-10.png)
## 核心技术

| 层级       | 技术               | 用途                              |
| ---------- | ------------------ | --------------------------------- |
| **前端**   | React 18.2.0       | 基于 hooks 状态管理的现代 UI 框架 |
| **前端**   | Vite 5.4.1         | 快速开发服务器和构建工具          |
| **前端**   | Axios 1.6.0        | 用于 API 通信的 HTTP 客户端       |
| **后端**   | Rust Actix Web 4.0 | 高性能异步 Web 框架               |
| **后端**   | SQLx 0.7           | 与 MySQL 配合的类型安全数据库操作 |
| **数据库** | MySQL              | 存储照片元数据的关系型数据库      |
| **存储**   | 文件系统           | 上传图像的本地文件存储            |

## 核心功能

### 📸 照片管理

- **上传**：支持拖拽或点击上传界面，提供实时预览
- **存储**：基于 UUID 的自动文件命名和组织
- **元数据**：每张照片的标题和可选描述
- **展示**：响应式网格布局，带有悬停效果和动画

### 🔧 技术亮点

- **类型安全**：Rust 的编译时保证和 SQLx 的类型检查查询
- **性能**：全栈采用 async/await 模式实现最佳并发
- **错误处理**：全面的错误管理，提供友好的用户反馈
- **安全性**：CORS 配置和文件验证确保安全上传
- **响应式**：使用 Tailwind CSS 实现移动优先设计

## 项目结构

```
rustPac_photowall/
├── backend/  
│   ├── src/                  
│   │   ├── main.rs            # 服务器入口点和配置
│   │   ├── handlers.rs        # HTTP 请求处理器
│   │   ├── models.rs          # 数据模型和结构
│   │   └── db.rs              # 数据库操作
│   └── Cargo.toml             # Rust 依赖
├── frontend/                   # React 应用
│   ├── src/
│   │   ├── App.jsx            # 主应用组件
│   │   ├── main.jsx           # React 入口点
│   │   └── index.css          # 全局样式
│   └── package.json           # Node.js 依赖
└── uploads/                    # 文件存储目录
```

## API 端点

| 方法   | 端点                  | 描述                       |
| ------ | --------------------- | -------------------------- |
| GET    | `/api/photos`         | 获取所有照片及其元数据     |
| POST   | `/api/photos`         | 上传新照片并附带标题和描述 |
| DELETE | `/api/photos/{id}`    | 根据 ID 删除照片           |
| GET    | `/uploads/{filename}` | 提供上传的图像文件服务     |

## 数据库模式

应用程序使用一个结构良好的表来存储照片元数据：

```sql
CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_upload_time (upload_time)
);
```

## 快速开始

完整的设置和部署说明将在以下章节中介绍：

1. [quickStart](quickStart.md)
2. [projectStruct](projectStruct.md)