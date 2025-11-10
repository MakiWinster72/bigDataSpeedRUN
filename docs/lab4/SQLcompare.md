# 实验目的
1. 理解四种数据库(MySQL,HBase,Redis,MongoDB)的概念以及不同点;
2. 熟练使用四种数据库操作常用的Shell命令；
3. 熟悉四种数据库操作常用的Java API。

---

# 1️⃣ MySQL 

> [!note]
> Ubuntu 20.04 起默认用 MariaDB, 因为它开源社区主导、维护活跃且与 MySQL 兼容。MySQL 和 MariaDB 功能、命令和配置基本兼容，本质相似。
### 实验要求

#### 学生表 `student`

|Name|English|Math|Computer|
|---|---|---|---|
|zhangsan|69|86|77|
|lisi|55|100|88|

#### 操作要求

① 设计 `student` 表格，`SELECT` 输出所有信息；  
② 查询 `zhangsan` 的 `Computer` 成绩；  
③ 修改 `lisi` 的 `Math` 成绩为 95。

#### Java 客户端操作

① 添加学生数据：

|Name|English|Math|Computer|
|---|---|---|---|
|scofield|45|89|100|

② 获取 `scofield` 的 `English` 成绩。

---


### ① 安装 MySQL / MariaDB

```bash
sudo apt update
sudo apt install mariadb-server libmariadb-java -y
sudo systemctl start mariadb
sudo systemctl enable mariadb // 开机自启
sudo mysql_secure_installation
```

### ② 登录 MySQL

```bash
sudo mariadb -u root -p #若没有设置密码请直接Enter
```

### ③ 创建数据库和表格

```sql
CREATE DATABASE school;
USE school;

CREATE TABLE student (
  name VARCHAR(20),
  English INT,
  Math INT,
  Computer INT
);

INSERT INTO student VALUES
('zhangsan', 69, 86, 77),
('lisi', 55, 100, 88);
```

### ④ 查询与修改

```sql
-- 输出所有信息
SELECT * FROM student;

-- 查询 zhangsan 的 Computer
SELECT Computer FROM student WHERE name='zhangsan';

-- 修改 lisi 的 Math 为 95
UPDATE student SET Math=95 WHERE name='lisi';
```

### ⑤ Java 客户端操作

1. 下载 Java JDK：

```bash
sudo apt install openjdk-17-jdk -y
```

2. 创建源文件：

```bash
vim MysqlStudent.java
```

粘贴：

```java
import java.sql.*;

public class MysqlStudent {
    public static void main(String[] args) throws Exception {
        Class.forName("org.mariadb.jdbc.Driver");
        Connection conn = DriverManager.getConnection(
            "jdbc:mariadb://localhost:3306/school?useSSL=false&serverTimezone=UTC",
            "root", "StrongPassword"); // 用户以及密码
        Statement stmt = conn.createStatement();

        // 添加数据
        stmt.executeUpdate("INSERT INTO student VALUES ('scofield', 45, 89, 100)");

        // 获取 scofield 的 English 成绩
        ResultSet rs = stmt.executeQuery("SELECT English FROM student WHERE name='scofield'");
        while (rs.next()) {
            System.out.println("scofield English: " + rs.getInt("English"));
        }

        rs.close();
        stmt.close();
        conn.close();
    }
}
```
① **导入 JDBC**：`import java.sql.*;` 导入了 JDBC 所需的所有类，包括 `Connection`、`Statement`、`ResultSet`。

② **加载驱动**：`Class.forName("org.mariadb.jdbc.Driver");` 用于动态加载 MariaDB JDBC 驱动。

③ **建立连接**：`DriverManager.getConnection(...)` 返回数据库连接对象。URL 指向本地数据库 `school`，包含时区和 SSL 设置。

④ **创建语句对象**：`Statement stmt = conn.createStatement();` 用于执行 SQL 语句。

⑤ **插入数据**：`executeUpdate` 执行增、删、改操作。

⑥ **查询数据**：`executeQuery` 返回 `ResultSet`，循环读取结果，使用 `rs.getInt("English")` 获取指定列。

⑦ **关闭资源**：`ResultSet`、`Statement`、`Connection` 都必须关闭以释放数据库连接。

3. 编译运行：

```bash
javac -cp /usr/share/java/mariadb-java-client.jar MysqlStudent.java
java -cp .:/usr/share/java/mariadb-java-client.jar MysqlStudent
```

---

# 2️⃣ HBase 

请前往此处安装好HBase -> [hbaseInstall](../lab3/hbaseInstall.md)

### 实验要求

#### 学生表 `student`

|name|score|English|Math|Computer|
|---|---|---|---|---|
|zhangsan|69|86|77||
|lisi|55|100|88||

#### 操作要求

① 用 HBase Shell 设计表格并 `scan` 浏览；  
② 查询 `zhangsan` 的 `Computer` 成绩；  
③ 修改 `lisi` 的 `Math` 成绩为 95。

#### Java API 操作

① 添加学生 `scofield`：English:45, Math:89, Computer:100；  
② 获取 `scofield` 的 `English` 成绩。

---

### ① HBase Shell 操作

```bash
hbase shell

# 创建表并插入数据
create 'student', 'score'
put 'student', 'zhangsan', 'score:English', '69'
put 'student', 'zhangsan', 'score:Math', '86'
put 'student', 'zhangsan', 'score:Computer', '77'
put 'student', 'lisi', 'score:English', '55'
put 'student', 'lisi', 'score:Math', '100'
put 'student', 'lisi', 'score:Computer', '88'

# 查看表
scan 'student'

# 查询 zhangsan 的 Computer
get 'student', 'zhangsan', 'score:Computer'

# 修改 lisi 的 Math
put 'student', 'lisi', 'score:Math', '95'
```

### ② Java 客户端操作

1. 下载 HBase 依赖 jar（示例使用 Maven 或自行下载 hbase-client、hadoop-common 等 jar）
2. 编写 Java 源文件 `HBaseStudent.java`
```java
import org.apache.hadoop.hbase.*;
import org.apache.hadoop.hbase.client.*;
import org.apache.hadoop.conf.Configuration;

public class HBaseStudent {
    public static void main(String[] args) throws Exception {
        Configuration config = HBaseConfiguration.create();
        Connection connection = ConnectionFactory.createConnection(config);
        Table table = connection.getTable(TableName.valueOf("student"));

        // 添加数据
        Put put = new Put("scofield".getBytes());
        put.addColumn("score".getBytes(), "English".getBytes(), "45".getBytes());
        put.addColumn("score".getBytes(), "Math".getBytes(), "89".getBytes());
        put.addColumn("score".getBytes(), "Computer".getBytes(), "100".getBytes());
        table.put(put);

        // 获取 English 成绩
        Get get = new Get("scofield".getBytes());
        get.addColumn("score".getBytes(), "English".getBytes());
        Result result = table.get(get);
        byte[] value = result.getValue("score".getBytes(), "English".getBytes());
        System.out.println("scofield English: " + new String(value));

        table.close();
        connection.close();
    }
}
```
① **导入 HBase API**：包括 `Connection`、`Table`、`Put`、`Get`、`Result` 等。

② **创建连接**：通过 `HBaseConfiguration.create()` 获取默认配置，然后 `ConnectionFactory.createConnection(config)` 建立连接。

③ **获取表对象**：`connection.getTable(TableName.valueOf("student"))` 用于操作指定表。

④ **添加数据**：

- `Put put = new Put("rowKey".getBytes());` 定义行键
    
- `addColumn(family, qualifier, value)` 指定列族、列名和数据
    
- `table.put(put)` 写入表中
    

⑤ **读取数据**：

- `Get get = new Get(rowKey)` 定义要读取的行
    
- `addColumn(family, qualifier)` 指定列
    
- `table.get(get)` 返回 `Result` 对象
    
- `result.getValue(family, qualifier)` 获取列值
    

⑥ **关闭资源**：HBase 连接和表对象需要手动关闭，否则可能导致资源泄漏。

3. 编译运行
```bash
javac -cp $(hbase classpath):. HBaseStudent.java
java -cp $(hbase classpath):. HBaseStudent
```
---

# 3️⃣ Redis 

### 实验要求

### 3.3 Redis 数据库操作

#### 学生键值对（哈希结构）

- student.zhangsan:
    

```text
English: 69
Math: 86
Computer: 77
```

- student.lisi:
    

```text
English: 55
Math: 100
Computer: 88
```

#### 操作要求

① 用 `hgetall` 输出 `zhangsan` 和 `lisi` 的成绩；  
② 用 `hget` 查询 `zhangsan` 的 `Computer` 成绩；  
③ 修改 `lisi` 的 `Math` 成绩为 95。

#### Java 客户端 (Jedis)

① 添加学生 `scofield`:

```text
English: 45
Math: 89
Computer: 100
```

② 获取 `scofield` 的 `English` 成绩。


### ① 安装 Redis

```bash
sudo apt install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### ② Redis CLI 操作

```bash
redis-cli

# 添加数据
HSET student:zhangsan English 69 Math 86 Computer 77
HSET student:lisi English 55 Math 100 Computer 88

# 查询所有
HGETALL student:zhangsan
HGETALL student:lisi

# 查询 zhangsan 的 Computer
HGET student:zhangsan Computer

# 修改 lisi Math
HSET student:lisi Math 95
```

### ③ Java 客户端（Jedis）

1. 下载 Jedis jar：

```bash
wget https://repo1.maven.org/maven2/redis/clients/jedis/5.1.0/jedis-5.1.0.jar
```

2. 编写 `RedisStudent.java`：

```java
import redis.clients.jedis.Jedis;

public class RedisStudent {
    public static void main(String[] args) {
        Jedis jedis = new Jedis("localhost");

        jedis.hset("student:scofield", "English", "45");
        jedis.hset("student:scofield", "Math", "89");
        jedis.hset("student:scofield", "Computer", "100");

        String english = jedis.hget("student:scofield", "English");
        System.out.println("scofield English: " + english);

        jedis.close();
    }
}
```
① **导入 Jedis**：Jedis 是 Redis 的 Java 客户端。

② **建立连接**：`new Jedis("localhost")` 连接本地 Redis 服务器，默认端口 6379。

③ **写入哈希表**：`hset("key", "field", "value")` 向哈希结构插入字段和值。

④ **读取字段**：`hget("key", "field")` 获取指定字段的值。

⑤ **关闭连接**：`jedis.close()` 释放 Redis 连接。


3. 编译运行：

```bash
javac -cp jedis-5.1.0.jar RedisStudent.java
java -cp .:jedis-5.1.0.jar RedisStudent
```

---

# 4️⃣ MongoDB 
### 实验要求

#### 学生文档 `student` 集合

```json
{
  "name": "zhangsan",
  "score": { "English": 69, "Math": 86, "Computer": 77 }
}
{
  "name": "lisi",
  "score": { "English": 55, "Math": 100, "Computer": 88 }
}
```

#### 操作要求

① 用 `find()` 输出两个学生的信息；  
② 查询 `zhangsan` 的所有成绩（只显示 `score` 列）；  
③ 修改 `lisi` 的 `Math` 成绩为 95。

#### Java 客户端操作

① 添加学生 `scofield`:

```json
{
  "name": "scofield",
  "score": { "English": 45, "Math": 89, "Computer": 100 }
}
```

② 获取 `scofield` 的所有成绩信息（只显示 `score` 列）。
### ① 安装 MongoDB

```bash
sudo apt install mongodb -y
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### ② Mongo Shell 操作

```bash
mongosh

use school
db.student.insertMany([
  { name: "zhangsan", score: { English: 69, Math: 86, Computer: 77 } },
  { name: "lisi", score: { English: 55, Math: 100, Computer: 88 } }
])

# 查询
db.student.find().pretty()
db.student.find({name:"zhangsan"}, {_id:0, score:1})

# 修改 lisi Math
db.student.updateOne({name:"lisi"}, {$set: {"score.Math":95}})
```

### ③ Java 客户端操作

1. 下载 MongoDB Java 驱动：

```bash
wget https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-sync/4.11.1/mongodb-driver-sync-4.11.1.jar

wget https://repo1.maven.org/maven2/org/mongodb/bson/4.11.1/bson-4.11.1.jar

wget https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-core/4.11.1/mongodb-driver-core-4.11.1.jar
```

2. 创建 `MongoStudent.java`：

```java
import com.mongodb.client.*;
import org.bson.Document;

public class MongoStudent {
    public static void main(String[] args) {
        MongoClient client = MongoClients.create("mongodb://localhost:27017");
        MongoDatabase db = client.getDatabase("school");
        MongoCollection<Document> col = db.getCollection("student");

        Document scofield = new Document("name", "scofield")
                .append("score", new Document("English", 45)
                        .append("Math", 89)
                        .append("Computer", 100));
        col.insertOne(scofield);

        Document result = col.find(new Document("name", "scofield"))
                .projection(new Document("_id", 0).append("score", 1))
                .first();
        System.out.println(result.toJson());
        client.close();
    }
}
```
① **导入 MongoDB Java 驱动**：`com.mongodb.client.*` 和 `org.bson.Document`。

② **连接 MongoDB**：`MongoClients.create("mongodb://localhost:27017")` 返回客户端对象。

③ **获取数据库和集合**：`getDatabase`、`getCollection` 用于操作特定数据库和集合（表的概念）。

④ **插入文档**：

- `Document` 类表示 MongoDB 的 JSON 文档
    
- `append` 方法用于嵌套字段
    
- `insertOne` 写入集合
    

⑤ **查询文档**：

- `find` 查询指定条件
    
- `projection` 排除 `_id` 字段，只返回 `score`
    
- `first()` 获取第一个匹配文档
    

⑥ **关闭客户端**：`client.close()` 释放资源。


3. 编译运行：

```bash
javac -cp ".:mongodb-driver-sync-4.11.1.jar:bson-4.11.1.jar:mongodb-driver-core-4.11.1.jar" MongoStudent.java
java -cp ".:mongodb-driver-sync-4.11.1.jar:bson-4.11.1.jar:mongodb-driver-core-4.11.1.jar" MongoStudent
```
