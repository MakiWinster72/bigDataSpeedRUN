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

[freeRDS](../other/freeRDS.md)
> 实验要求创建 mysql，但 DATABASE mysql 是预装就有的，用于存放用户数据，所以我们换一个名字。
## 任务二

① 使用任意方式连接 MySQL 数据库。  
② 在 _mysql_ 数据库中新建表 _user_，包含 4 列：`id`（主键）、`name`、`age`、`sex`。  
③ 对 _user_ 表进行增、删、改、查操作。

通过申请公网地址连接数据库

- 连接命令
    

```
mariadb -h 数据库地址 -P 3306 -u 用户名 -p --ssl=0
```

![](assets/2025-11-11-1.png)

- 查看 mydb 数据库是否存在
    

```sql
SHOW DATABASES;

# 任务一中已经创建，或现在创建一个
CREATE DATABASE mydb;
```

![](assets/2025-11-11-3.png)

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

![](assets/2025-11-11-4.png)

- 插入数据
    

```sql
INSERT INTO user (id, name, age, sex)
VALUES (1, 'Alice', 23, 'F');

INSERT INTO user (id, name, age, sex)
VALUES (2, 'Box', 25, 'M');
```

![](assets/2025-11-11-5.png)

- 查询数据
    

```sql
SELECT * FROM user;
```

![](assets/2025-11-11-6.png)

- 更新数据
    

```sql
UPDATE user SET age=26
WHERE id=2;

# 检验修改是否成功
SELECT * FROM user;
```

![](assets/2025-11-11-7.png)

- 删除数据
    

```sql
DELETE FROM user
WHERE id=1;

# 检验删除是否成功
SELECT * FROM user;
```

![](assets/2025-11-11-8.png)

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

Ubuntu 20.04或更早

```bash
mysql -u root -p
```

![](assets/2025-11-11-9.png)

- 创建 mydb 数据库并新建 user 表，插入示例数据
    

```sql
INSERT INTO user (id, name, age, sex) VALUES (1, 'Alice', 22, 'F');
INSERT INTO user (id, name, age, sex) VALUES (2, 'Bob', 25, 'M');
INSERT INTO user (id, name, age, sex) VALUES (3, 'Cha', 23, 'F');
INSERT INTO user (id, name, age, sex) VALUES (4, 'Dia', 21, 'F');
INSERT INTO user (id, name, age, sex) VALUES (5, 'Eve', 23, 'F');
```

![](assets/2025-11-11-10.png)

- 创建迁移账号
    

```sql
CREATE USER '用户名'@'%' IDENTIFIED BY '密码';
```

![](assets/2025-11-11-11.png)

- 授权迁移账号
    

```sql
GRANT ALL PRIVILEGES ON mydb.* TO '用户名'@'%';
FLUSH PRIVILEGES;
```

![](assets/2025-11-11-12.png)

- 编辑 /etc/my.cnf.d/server.cnf
    

```cnf
[mysql]
log-bin = mysql-bin
binlog_format = ROW
server-id = 1
```

![](assets/2025-11-11-13.png)

- 重新启动 MariaDB 服务
    

```bash
sudo systemctl restart mariadb.service
```

- 检查配置是否生效
    

```bash
mariadb -u 用户名 -p密码 -e "SHOW VARIABLES LIKE 'binlog_format';"
```

![](assets/2025-11-11-14.png)

- 导出本地数据库
    

```bash
mysqldump -u 用户名 -p密码 --databases mydb --routines --triggers --single-transaction --master-data=2 > 文件名.sql
```

![](assets/2025-11-11-15.png)  
![](assets/2025-11-11-17.png)

- 导入到 RDS
    

```bash
mariadb -h RDS地址 -P 3306 -u 用户名 -p --ssl=0 < 备份的sql文件
```

![](assets/2025-11-11-18.png)

- 连接 RDS 并查询
    

```bash
mariadb -h RDS地址 -P 3306 -u 用户名 -p --ssl=0
```

```sql
USE mydb;
SELECT * FROM user;
```

![](assets/2025-11-11-20.png)

> 数据与本地 user 表相符，导入成功 🥳

## 任务四
① 在本地新建一个简单应用程序，程序需使用 RDS 数据库中的 _user_ 表的数据。  
② 配置该程序的配置文件，使程序可以正常运行。

> 本项目实例使用 *Rust + React* 构建 
1. 简单构建了一个图片存储项目, 项目结构如下：

```
photo-wall
├── backend
│   ├── Cargo.toml
│   └── src
│       ├── db.rs
│       ├── handlers.rs
│       ├── main.rs
│       └── models.rs
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
├── package.json
└── uploads
```

通过在.env 中明文存放了 RDS 的账号密码连接数据库
**cat photo-wall/backend/.env**
```env
DATABASE_URL=mysql://用户名:(数据库密码)@rm-cn-fsw4igyvf0002a2o.rwlb.rds.al
iyuncs.com:3306/photo_wall
SERVER_HOST=127.0.0.1
SERVER_PORT=8080
UPLOAD_DIR=绝对路径/photo-wall/uploads
```

效果：
![](assets/2025-11-11-21.png)
![](assets/2025-11-11-22.png)

添加/删除照片时，RDS 会同步更新：
![](assets/2025-11-11-23.png)

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
    
