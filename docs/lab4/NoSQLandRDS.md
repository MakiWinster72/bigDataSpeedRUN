# 1️⃣ MySQL 实验

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
sudo mariadb -u root -p
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
nano MysqlStudent.java
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

3. 编译运行：

```bash
javac -cp /usr/share/java/mariadb-java-client.jar MysqlStudent.java
java -cp .:/usr/share/java/mariadb-java-client.jar MysqlStudent
```

---

# 2️⃣ HBase 实验

### ① 安装 HBase（单节点测试）

```bash
sudo apt install openjdk-17-jdk -y
wget https://downloads.apache.org/hbase/3.5.3/hbase-3.5.3-bin.tar.gz
tar -xzf hbase-3.5.3-bin.tar.gz
mv hbase-3.5.3 /opt/hbase
```

### ② 配置环境变量

```bash
echo 'export HBASE_HOME=/opt/hbase' >> ~/.bashrc
echo 'export PATH=$PATH:$HBASE_HOME/bin' >> ~/.bashrc
source ~/.bashrc
```

### ③ 启动 HBase

```bash
$HBASE_HOME/bin/start-hbase.sh
```

### ④ HBase Shell 操作

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

### ⑤ Java 客户端操作

1. 下载 HBase 依赖 jar（示例使用 Maven 或自行下载 hbase-client、hadoop-common 等 jar）
2. 编写 Java 源文件 `HBaseStudent.java`
3. 编译运行（注意添加所有 HBase 依赖到 classpath）

---

# 3️⃣ Redis 实验

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

3. 编译运行：

```bash
javac -cp jedis-5.1.0.jar RedisStudent.java
java -cp .:jedis-5.1.0.jar RedisStudent
```

---

# 4️⃣ MongoDB 实验

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

3. 编译运行：

```bash
javac -cp ".:mongodb-driver-sync-4.11.1.jar:bson-4.11.1.jar:mongodb-driver-core-4.11.1.jar" MongoStudent.java
java -cp ".:mongodb-driver-sync-4.11.1.jar:bson-4.11.1.jar:mongodb-driver-core-4.11.1.jar" MongoStudent
```
