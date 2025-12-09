> [!note]
> 本教程在 Ubuntu 24.04.03 lts 上演示安装 Hbase。
> 请先安装好 hadoop:[伪分布式](../lab1/PseudoDistributed.md)

> [!tip] 🎉
> 已有 sh 脚本可一键安装完成 -> [shell](../other/shell.md#hbase)

## 安装 HBase 教程

### ① 环境准备

`~/.profile`增加

```bash
export ZOOKEEPER_HOME=/usr/local/zookeeper
export PATH=$PATH:$ZOOKEEPER_HOME/bin
export HBASE_HOME=/usr/local/hbase
export PATH=$PATH:$HBASE_HOME/bin
```

---

### ② 安装 ZooKeeper

1. 解压 ZooKeeper：

   ```bash
   sudo tar -xzf apache-zookeeper-3.8.5-bin.tar.gz -C /usr/local/zookeeper
   ```

> [!note]
> mv 是移动文件的命令，当文件被移动到原文件夹并且指定不同的名字，就完成了重命名操作

2. 创建配置文件：

   ```bash
   cp $ZOOKEEPER_HOME/conf/zoo_sample.cfg $ZOOKEEPER_HOME/conf/zoo.cfg
   ```

   修改配置：

   - `dataDir=/home/hadoop/zookeeper/data`
   - `clientPort=2181`

   ```bash
   sudo mkdir -p /usr/local/zookeeper/data
   ```

3. 启动 ZooKeeper：

   ```bash
   zkServer.sh start
   zkServer.sh status
   ```

---

### ③ 安装 HBase

1. 解压 HBase：

   ```bash
   tar -xzf hbase-2.6.3-bin.tar.gz -C /usr/local/hbase
   ```

2. 配置 HBase：

   编辑 `$HBASE_HOME/conf/hbase-site.xml`，添加最小配置：

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
<!-- true是分布式模式，false是单机模式(HBase和Zk运行在同一个JVM) -->
  <property>
    <name>hbase.cluster.distributed</name>
    <value>true</value>
  </property>
<!-- HBase的根目录，在HDFS下的/hbase -->
  <property>
    <name>hbase.rootdir</name>
    <value>hdfs://localhost:9000/hbase</value>
  </property>
  <property>
    <name>hbase.zookeeper.quorum</name>
    <value>localhost</value>
  </property>
  <property>
      <name>hbase.zookeeper.property.dataDir</name>
      <value>/usr/local/zookeeper/data</value>
  </property>
  <property>
      <name>hbase.zookeeper.property.clientPort</name>
      <value>2181</value>
  </property>
  <property>
    <name>hbase.unsafe.stream.capability.enforce</name>
    <value>false</value>
  </property>
</configuration>
```

## 配置 HBase 环境变量

1. 打开配置文件

```bash
vim $HBASE_HOME/conf/hbase-env.sh
```

2. 查找并设置以下内容

```bash
export HBASE_MANAGES_ZK=false
export JAVA_HOME=/usr/lib/jvm/jdk21
export HBASE_CLASSPATH=/usr/local/hadoop/etc/hadoop
export HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP="true"
```

3. 保存并退出
   在 `vim` 中输入

```
:wq
```

### ④ 启动 HBase

1. 初始化 HBase 目录：

```bash
   hdfs dfs -mkdir -p /hbase
   hdfs dfs -chown hadoop:hadoop /hbase
```

2. 启动 HBase：

   ```bash
   start-hbase.sh
   ```

3. 检查 HBase 状态：

   ```bash
   hbase shell
   ```

   在 shell 中输入：

   ```bash
   status
   ```

   若显示 `Master is running` 和 `RegionServers` 列表，则启动成功。

查看 jps
![](https://img.makis-life.cn/images/20251110181408594.png)

---

### ⑤ 测试 HBase

1. 创建表：

   ```bash
   create 'test', 'cf'
   ```

2. 插入数据：

   ```bash
   put 'test', 'row1', 'cf:col1', 'value1'
   ```

3. 查询数据：

   ```bash
   get 'test', 'row1'
   ```

---

### ⑥ 停止 HBase

```bash
stop-hbase.sh
```
