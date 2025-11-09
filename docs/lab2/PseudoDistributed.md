## Hadoop 伪分布式安装

### 修改 core-site.xml 与 hdfs-site.xml

**core-site.xml**

```xml
<configuration>
  <property>
    <name>hadoop.tmp.dir</name>
    <value>file:/usr/local/hadoop/tmp</value> <!-- Hadoop 安装路径 -->
    <description>A base for other temporary directories.</description>
  </property>
  <property>
    <name>fs.defaultFS</name>
    <value>hdfs://localhost:9000</value>
  </property>
</configuration>
```

**hdfs-site.xml**

```xml
<configuration>
  <property>
    <name>dfs.replication</name>
    <value>1</value>
  </property>
  <property>
    <name>dfs.namenode.name.dir</name>
    <value>file:/usr/local/hadoop/tmp/dfs/name</value> <!-- Hadoop 安装路径 -->
  </property>
  <property>
    <name>dfs.datanode.data.dir</name>
    <value>file:/usr/local/hadoop/tmp/dfs/data</value> <!-- Hadoop 安装路径 -->
  </property>
</configuration>
```

---

### 启动 HDFS

```bash
./sbin/start-dfs.sh
```

![](assets/2025-09-20-7.png)

> 若报错找不到 `JAVA_HOME`，是因为 Hadoop 启动脚本不读取 `~/.bashrc`。
> 需在 `$HADOOP_HOME/etc/hadoop/hadoop-env.sh` 中添加：
>
> `export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64`

使用 `jps` 可查看 Hadoop 启动的 Java 进程，如：
![](assets/2025-09-20-11.png)

---

### 安全组开放 9870 端口

若在云服务器上运行，需要在控制台安全组中开放 **9870** 端口（用于访问 Hadoop Dashboard）。

以阿里云为例：
![](assets/2025-09-20-9.png)

---

### 访问 Hadoop Dashboard

在浏览器访问：

```
http://<服务器IP>:9870
```

![](assets/2025-09-20-8.png)

---

### 测试上传与计算

```bash
# 创建 Hadoop 用户目录
cd $HADOOP_HOME
./bin/hdfs dfs -mkdir -p /user/hadoop

# 新建 input 目录
./bin/hdfs dfs -mkdir /user/hadoop/input

# 上传配置文件到 HDFS
./bin/hdfs dfs -put ./etc/hadoop/*.xml /user/hadoop/input

# 运行示例程序 Grep
hadoop jar /usr/local/hadoop/share/hadoop/mapreduce/hadoop-mapreduce-examples-3.4.2.jar grep /user/hadoop/input output 'dfs[a-z.]+'

# 查看结果
./bin/hdfs dfs -cat output/*
```

![](assets/2025-09-20-10.png)

---

### 停止 HDFS

```bash
./sbin/stop-dfs.sh
```

![](assets/2025-09-20-12.png)
