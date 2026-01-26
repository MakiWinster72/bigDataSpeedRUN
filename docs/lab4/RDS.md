# RDS for MySQL

## 实验目的

1. 了解阿里云 RDS（_Relational Database Service_）。
2. 熟练使用 MySQL 数据库操作命令。
3. 熟悉连接 RDS for MySQL 数据库的方法。

## 实验要求

### 1. 阿里云 RDS 实例准备

① 新用户可以使用免费体验 RDS 服务，并在实例上新建 RDS 数据库 _mysql_。  
② 购买 RDS 实例，并进行管理。  
③ 在该实例上新建数据库 _mysql_。

### 2. MySQL 数据库操作

① 使用任意方式连接 MySQL 数据库。  
② 在 _mysql_ 数据库中新建表 _user_，包含 4 列：`id`（主键）、`name`、`age`、`sex`。  
③ 对 _user_ 表进行增、删、改、查操作。

### 3. MySQL 数据迁移至 RDS

① 在本地新建 MySQL 数据库。  
② 在本地数据库 _mysql_ 中创建一个迁移账号。  
③ 设置迁移账号的权限。  
④ 修改本地 MySQL 配置文件。  
⑤ 确认本地数据库的存储引擎为 **ROW**。  
⑥ 将数据迁移至 RDS。

### 4. 应用程序使用 RDS 数据库

① 在本地新建一个简单应用程序，程序需使用 RDS 数据库中的 _user_ 表的数据。  
② 配置该程序的配置文件，使程序可以正常运行。

## 任务一

① 新用户可以使用免费体验 RDS 服务，并在实例上新建 RDS 数据库 _mysql_。  
② 购买 RDS 实例，并进行管理。  
③ 在该实例上新建数据库 _mysql_。

请前往[freeRDS](../other/freeRDS.md)获取 RDS 试用，或[InstallMysqlInUbuntu(mariadb)](<InstallMysqlInUbuntu(mariadb).md>)在实验一获取的 ECS 服务器上自行安装 Mysql，创建远程用户进行连接。

> 实验要求创建 mysql，但 DATABASE mysql 是预装就有的，用于存放用户数据，所以我们换一个名字。

![](https://img.makis-life.cn/images/20251205082703131.png?x-oss-process=style/yasuo)

> 默认环境中已有 mysql database

## 任务二

① 使用任意方式连接 MySQL 数据库。  
② 在 _mysql_ 数据库中新建表 _user_，包含 4 列：`id`（主键）、`name`、`age`、`sex`。  
③ 对 _user_ 表进行增、删、改、查操作。

通过申请公网地址连接数据库

连接命令

```
mariadb -h 数据库地址 -P 3306 -u 用户名 -p --ssl=0
```

![](https://img.makis-life.cn/images/20251110181229410.png?x-oss-process=style/yasuo)

查看 mydb 数据库是否存在

```sql
SHOW DATABASES;

# 任务一中已经创建，或现在创建一个
CREATE DATABASE mydb;
```

![](https://img.makis-life.cn/images/20251110181229411.png?x-oss-process=style/yasuo)

> 实验要求创建 mysql，但 DATABASE mysql 是预装就有的，用于存放用户数据，所以我们换一个名字。

- 创建 user 表

```sql
CREATE TABLE user (
 id INT PRIMARY KEY,
 name VARCHAR(50),
 age INT,
 sex ENUM('M','F')
);
```

![](https://img.makis-life.cn/images/20251110181229412.png?x-oss-process=style/yasuo)

- 插入数据

```sql
INSERT INTO user (id, name, age, sex)
VALUES (1, 'Alice', 23, 'F');

INSERT INTO user (id, name, age, sex)
VALUES (2, 'Box', 25, 'M');
```

![](https://img.makis-life.cn/images/20251110181229413.png?x-oss-process=style/yasuo)

- 查询数据

```sql
SELECT * FROM user;
```

![](https://img.makis-life.cn/images/20251110181229414.png?x-oss-process=style/yasuo)

- 更新数据

```sql
UPDATE user SET age=26
WHERE id=2;

# 检验修改是否成功
SELECT * FROM user;
```

![](https://img.makis-life.cn/images/20251110181229415.png?x-oss-process=style/yasuo)

- 删除数据

```sql
DELETE FROM user
WHERE id=1;

# 检验删除是否成功
SELECT * FROM user;
```

![](https://img.makis-life.cn/images/20251110181229416.png?x-oss-process=style/yasuo)

## 任务三

① 在本地新建 MySQL 数据库。  
② 在本地数据库 _mysql_ 中创建一个迁移账号。  
③ 设置迁移账号的权限。  
④ 修改本地 MySQL 配置文件。  
⑤ 确认本地数据库的存储引擎为 **ROW**。  
⑥ 将数据迁移至 RDS。

- 登录本地 MySQL

```bash
mariadb -u root -p
```

Ubuntu 20.04 或更早

```bash
mysql -u root -p
```

![](https://img.makis-life.cn/images/20251110181229417.png?x-oss-process=style/yasuo)

- 创建 mydb 数据库并新建 user 表，插入示例数据

```sql
INSERT INTO user (id, name, age, sex) VALUES (1, 'Alice', 22, 'F');
INSERT INTO user (id, name, age, sex) VALUES (2, 'Bob', 25, 'M');
INSERT INTO user (id, name, age, sex) VALUES (3, 'Cha', 23, 'F');
INSERT INTO user (id, name, age, sex) VALUES (4, 'Dia', 21, 'F');
INSERT INTO user (id, name, age, sex) VALUES (5, 'Eve', 23, 'F');
```

![](https://img.makis-life.cn/images/20251110181229418.png?x-oss-process=style/yasuo)

- 创建迁移账号

```sql
CREATE USER '用户名'@'localhost' IDENTIFIED BY '密码';
```

![](https://img.makis-life.cn/images/20251110181229419.png?x-oss-process=style/yasuo)

- 授权迁移账号

```sql
GRANT ALL PRIVILEGES ON mydb.* TO '用户名'@'localhost';
FLUSH PRIVILEGES;
```

![](https://img.makis-life.cn/images/20251110181229420.png?x-oss-process=style/yasuo)

- 编辑 /etc/my.cnf.d/server.cnf

```cnf
[mysql]
log-bin = mysql-bin
binlog_format = ROW
server-id = 1
```

![](https://img.makis-life.cn/images/20251110181229421.png?x-oss-process=style/yasuo)

> [!note] Why ROW?
>
> 1. ROW 模式是什么
>
> MySQL 的二进制日志（binlog）有三种格式：
>
> STATEMENT（语句模式）：记录执行的 SQL 语句
>
> ROW（行模式）：记录数据变更的具体行信息
>
> MIXED（混合模式）：默认模式，语句模式与行模式结合
>
> 当你设置为 ROW：
>
> 日志中记录的是每一行数据的变化，而不是执行的 SQL 语句。
>
> 在主从复制或数据迁移时，更加精确，不会因为 SQL 语句执行结果不同而导致数据不一致。
>
> 1. 为什么迁移需要 ROW
>
> 保证数据一致性
>
> 语句模式（STATEMENT）在一些 SQL 函数（如 NOW()、UUID()）或 UPDATE ... LIMIT 语句下，主从执行结果可能不同。
>
> ROW 模式记录每一行的具体变更，RDS 接收到后能精确重放，避免数据差异。
>
> 兼容 RDS 复制要求
>
> Amazon RDS 复制或者使用 mysqldump --master-data 时，推荐 binlog_format 为 ROW，否则可能在某些场景下无法使用 GTID 或导致复制失败。
>
> 避免丢失或错误迁移数据
>
> ROW 模式记录了完整的行变更信息，即使表中有触发器（trigger）、默认值等复杂逻辑，也能正确迁移。

- 重新启动 MariaDB 服务

```bash
sudo systemctl restart mariadb.service
```

- 检查配置是否生效

```bash
mariadb -u 用户名 -p密码 -e "SHOW VARIABLES LIKE 'binlog_format';"
```

![](https://img.makis-life.cn/images/20251110181229422.png?x-oss-process=style/yasuo)

- 导出本地数据库

```bash
mariadb-dump -u 用户名 -p密码 --databases mydb --routines --triggers --single-transaction --master-data=2 > 文件名.sql
```

> [!note] 参数解析
> -u 用户名：登录 MariaDB 的用户名
>
> -p 密码：密码 (紧贴着会直接写入密码，若不紧贴则要求输入密码)
>
> --databases mydb：导出指定数据库
>
> --routines：导出存储过程/函数
>
> --triggers：导出触发器
>
> --single-transaction：使用事务一致性快照导出 InnoDB 表
>
> --master-data=2：记录二进制日志位点（注释形式）

![](https://img.makis-life.cn/images/20251205082703132.png?x-oss-process=style/yasuo)

- 导入到 RDS

```bash
mariadb -h RDS地址 -u 用户名 -p --ssl=0 < 备份的sql文件
```

![](https://img.makis-life.cn/images/20251110181229425.png?x-oss-process=style/yasuo)

- 连接 RDS 并查询

```bash
mariadb -h RDS地址 -u 用户名 -p --ssl=0
```

```sql
USE mydb;
SELECT * FROM user;
```

![](https://img.makis-life.cn/images/20251110181229426.png?x-oss-process=style/yasuo)

> 数据与本地 user 表相符，导入成功 🥳

## 任务四

① 在本地新建一个简单应用程序，程序需使用 RDS 数据库中的 _user_ 表的数据。  
② 配置该程序的配置文件，使程序可以正常运行。

> 本项目实例使用 _Rust + React_ 构建

1. 简单构建了一个图片存储项目, 项目结构如下：

```
photo-wall
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

通过在.env 中明文存放了 RDS 的账号密码连接数据库
`cat photo-wall/backend/.env`

```env
DATABASE_URL=mysql://用户名:(数据库密码)@数据库地址:端口号(默认3306)/模式(photo_wall)
SERVER_HOST=127.0.0.1
SERVER_PORT=8080
UPLOAD_DIR=绝对路径/photo-wall/uploads
```

效果：
![](https://img.makis-life.cn/images/20251110181229427.png?x-oss-process=style/yasuo)
![](https://img.makis-life.cn/images/20251110181229428.png?x-oss-process=style/yasuo)

添加/删除照片时，RDS 会同步更新：
![](https://img.makis-life.cn/images/20251110181229429.png?x-oss-process=style/yasuo)

### 关键代码

#### ① 创建数据库连接池 `create_pool`

```rust
pub async fn create_pool(database_url: &str) -> Result<MySqlPool, sqlx::Error> {
    MySqlPoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await
}
```

**作用**

- 建立 MySQL 数据库连接池（`MySqlPool`）
- 避免每次查询都新建连接，提高性能

---

#### ② 查询所有照片 `get_all_photos`

```rust
pub async fn get_all_photos(pool: &MySqlPool) -> Result<Vec<Photo>, sqlx::Error> {
    sqlx::query_as::<_, Photo>("SELECT * FROM photos ORDER BY upload_time DESC")
        .fetch_all(pool)
        .await
}
```

**作用**

- 查询数据库中所有照片记录
- 按 `upload_time` 倒序排序（最新上传的在前）
- `query_as::<_, Photo>` 将查询结果映射到自定义结构体 `Photo`

---

#### ③ 创建新照片 `create_photo`

```rust
pub async fn create_photo(
    pool: &MySqlPool,
    filename: &str,
    title: &str,
    description: Option<&str>,
) -> Result<Photo, sqlx::Error> {
    // 插入新照片记录
    sqlx::query("INSERT INTO photos (filename, title, description) VALUES (?, ?, ?)")
        .bind(filename)
        .bind(title)
        .bind(description)
        .execute(pool)
        .await?;

    // 查询刚插入的记录并返回
    sqlx::query_as::<_, Photo>("SELECT * FROM photos WHERE filename = ? ORDER BY id DESC LIMIT 1")
        .bind(filename)
        .fetch_one(pool)
        .await
}
```

**作用**

- 插入新照片记录
- 通过 `filename` 查询刚插入的记录并返回 `Photo`
- 使用 `?` 占位符防止 SQL 注入，`.bind()` 对应占位符传参
- `ORDER BY id DESC LIMIT 1` 确保取到最新记录

---

#### ④ 删除照片 `delete_photo`

```rust
pub async fn delete_photo(pool: &MySqlPool, id: i32) -> Result<String, sqlx::Error> {
    // 查询要删除的照片信息
    let photo = sqlx::query_as::<_, Photo>("SELECT * FROM photos WHERE id = ?")
        .bind(id)
        .fetch_one(pool)
        .await?;

    // 执行删除操作
    sqlx::query("DELETE FROM photos WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;

    // 返回被删除照片的 filename
    Ok(photo.filename)
}
```

**作用**

- 先查询再删除，以获取被删除照片信息
- 如果记录不存在，`fetch_one` 会报错
- 返回被删除照片的 `filename`

| 层级       | 技术               | 用途                              |
| ---------- | ------------------ | --------------------------------- |
| **前端**   | React 18.2.0       | 基于 hooks 状态管理的现代 UI 框架 |
| **前端**   | Vite 5.4.1         | 快速开发服务器和构建工具          |
| **前端**   | Axios 1.6.0        | 用于 API 通信的 HTTP 客户端       |
| **后端**   | Rust Actix Web 4.0 | 高性能异步 Web 框架               |
| **后端**   | SQLx 0.7           | 与 MySQL 配合的类型安全数据库操作 |
| **数据库** | MySQL              | 存储照片元数据的关系型数据库      |

详细文档 => [PhotoWall 概览](../photowallDocs/overview.md)
