## 系统要求

开始之前，请确保已安装以下必备组件：

| 组件      | 最低版本   | 安装链接                                |
| ------- | ------ | ----------------------------------- |
| Rust    | 1.70+  | [rustup.rs](https://rustup.rs/)     |
| Node.js | 18+    | [nodejs.org](https://nodejs.org/)   |
| MySQL   | 8.0+   | [mysql.com](https://www.mysql.com/) |
| Git     | latest | [git-scm.com](https://git-scm.com/) |

## 安装

### 1\. 克隆仓库

```bash
git clone https://github.com/MakiWinster72/rustPac_photowall.git
cd rustPac_photowall
```

### 2\. 后端设置

导航到后端目录并安装依赖项：

```bash
cd backend
cargo build
```

在后端目录中创建 `.env` 文件，配置你的数据库信息：

```env
DATABASE_URL=mysql://username:password@localhost:3306/photowall
SERVER_HOST=127.0.0.1
SERVER_PORT=8080
UPLOAD_DIR=../uploads
```

### 3\. 前端设置

导航到前端目录并安装依赖项：

```bash
cd ../frontend
npm install
```

### 4\. 数据库初始化

创建名为 `photowall` 的 MySQL 数据库并运行后端服务器以自动初始化架构：

```bash
cd ../backend
cargo run
```

后端将自动创建必要的 `photos` 表，结构如下：

```sql
CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 运行应用程序

### 开发模式

**终端 1 - 后端服务器：**

```bash
cd backend
cargo run
```

**终端 2 - 前端开发服务器：**

```bash
cd frontend
npm run dev
```

应用程序可通过以下地址访问：

-   前端：[http://localhost:5173](http://localhost:5173/)
-   后端 API：[http://localhost:8080](http://localhost:8080/)
-   上传目录：[http://localhost:8080/uploads](http://localhost:8080/uploads)

### 生产构建

**构建后端：**

```bash
cd backend
cargo build --release
```

**构建前端：**
```bash
cd frontend
npm run build
```

生产就绪文件将位于：

-   后端：`backend/target/release/backend`
-   前端：`frontend/dist`
