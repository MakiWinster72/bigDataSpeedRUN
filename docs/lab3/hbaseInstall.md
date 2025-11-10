> [!note]
> 本教程在 Ubuntu 24.04.03 lts 上演示安装Hbase。
> 请先安装好hadoop:[伪分布式](../lab1/PseudoDistributed.md)

## 安装 HBase 教程
### ① 环境准备

`~/.bashrc`增加

```bash
export ZOOKEEPER_HOME=/home/hadoop/zookeeper
export HBASE_HOME=/home/hadoop/hbase
export PATH=$PATH:$HBASE_HOME/bin
```


---

### ② 安装 ZooKeeper

1. 解压 ZooKeeper：
    
    ```bash
    tar -xzf apache-zookeeper-3.8.5-bin.tar.gz -C /home/hadoop/
    mv /home/hadoop/apache-zookeeper-3.8.5-bin /home/hadoop/zookeeper
    ```
    
> [!note]
> mv是移动文件的命令，当文件被移动到原文件夹并且指定不同的名字，就完成了重命名操作


1. 创建配置文件：
    
    ```bash
    cp $ZOOKEEPER_HOME/conf/zoo_sample.cfg $ZOOKEEPER_HOME/conf/zoo.cfg
    ```
    
    修改配置：
    
    - `dataDir=/home/hadoop/zookeeper/data`
        
    - `clientPort=2181`
        
    
    ```bash
    mkdir -p /home/hadoop/zookeeper/data
    ```
    
2. 启动 ZooKeeper：
    
    ```bash
    zkServer.sh start
    zkServer.sh status
    ```
    

---

### ③ 安装 HBase

1. 解压 HBase：
    
    ```bash
    tar -xzf hbase-2.6.3-bin.tar.gz -C /home/hadoop/
    mv /home/hadoop/hbase-2.6.3 /home/hadoop/hbase
    ```
    
2. 配置 HBase：
    
    编辑 `$HBASE_HOME/conf/hbase-site.xml`，添加最小配置：
    
```xml
<?xml version="0.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
<!-- true是分布式模式，false是单机模式(HBase和Zk运行在同一个JVM) -->
  <property>
    <name>hbase.cluster.distributed</name>
    <value>true</value>
  </property>
  <property>
    <name>hbase.wal.provider</name>
    <value>filesystem</value>
  </property>
  <property>
    <name>hbase.tmp.dir</name>
    <value>./tmp</value>
  </property>
<!-- HBase的根目录，在HDFS下的/hbase -->
  <property>
    <name>hbase.rootdir</name>
    <value>hdfs://localhost:9000/hbase</value>
  </property>
<!-- Zk的位置，这里是本机 -->
  <property>
    <name>hbase.zookeeper.quorum</name>
    <value>localhost</value>
  </property>
  <property>
    <name>hbase.unsafe.stream.capability.enforce</name>
    <value>false</value>
  </property>
</configuration>
```
    
1. 配置 HBase 环境变量。
```bash
vim $HBASE_HOME/conf/hbase-env.sh
```

找到JAVA_HOME(vim使用'/'进入搜索模式),添加为自己的java。
可以使用`update-alternatives --query java`查看jala路径

![](assets/2025-11-10-1.png)
>e.g:此处JAVA_HOME=/usr/lib/jvm/jdk1.8.0_202
---

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
    
查看jps
![](assets/2025-11-10-2.png)


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
