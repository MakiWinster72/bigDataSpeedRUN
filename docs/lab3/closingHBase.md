## 问题阐述
首次执行`start-hbase.sh`启动可以成功启动

1185 DataNode  # Hadoop
**2723 HMaster  # HBase**
**2883 HRegionServer  # HBase**
1542 QuorumPeerMain  # ZooKeeper
3513 Jps
1355 SecondaryNameNode  # Hadoop
1084 NameNode  # Hadoop

执行`stop-hbase.sh`后，正常关闭hbase，当再次启动时，HMaster在启动后迅速自动关闭，只剩下RegionServer

**4240 HRegionServer  # HBase**
1185 DataNode  # Hadoop
4565 Jps
1542 QuorumPeerMain  # ZooKeeper
1355 SecondaryNameNode  # Hadoop
1084 NameNode  # Hadoop


当清空`hdfs dfs -rm -r /hbase/MasterData/WALs`，手动关闭`RegionServer`后，可以正常启动
```bash
hadoop@vmubsver:~$ hdfs dfs -rm -r /hbase/MasterData/WALs
Deleted /hbase/MasterData/WALs

hadoop@vmubsver:~$ hbase-daemon.sh stop regionserver
stopping regionserver, logging to /home/hadoop/hbase/logs/hbase-hadoop-regionserver-vmubsver.out
stopping regionserver...
```

## 报错日志
日志过长，下面是`$HBASE_HOME/logs/hbase-hadoop-master-vmubsver.log`日志中`ERROR`的部分
```log
hadoop@vmubsver:~$ cat $HBASE_HOME/logs/hbase-hadoop-master-vmubsver.log | grep "ERROR"
2025-11-12T09:33:49,788 ERROR [master/vmubsver:16000:becomeActiveMaster] master.HMaster: Failed to become active master
2025-11-12T09:33:49,792 ERROR [master/vmubsver:16000:becomeActiveMaster] master.HMaster: ***** ABORTING master vmubsver,16000,1762940018858: Unhandled exception. Starting shutdown. *****
2025-11-12T09:33:52,437 ERROR [main] master.HMasterCommandLine: Master exiting
```
## 配置文件
#### hadoop
##### core-site.xml 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>hadoop.tmp.dir</name>
    <value>file:/usr/local/hadoop/tmp</value>
    <description>Base for other temporary directories.</description>
  </property>
  <property>
    <name>fs.defaultFS</name>
    <value>hdfs://localhost:9000</value>
  </property>
</configuration>
```
##### hdfs-site.xml 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>dfs.replication</name>
    <value>1</value>
  </property>
  <property>
    <name>dfs.namenode.name.dir</name>
    <value>file:/usr/local/hadoop/tmp/dfs/name</value>
  </property>
  <property>
    <name>dfs.datanode.data.dir</name>
    <value>file:/usr/local/hadoop/tmp/dfs/data</value>
  </property>
</configuration>
```
#### ZooKeeper
##### zoo.cfg 
```cfg
# 每个 tick 的毫秒数
tickTime=2000
# 初始同步阶段允许的最大 tick 数
initLimit=10
# 发送请求与收到确认之间允许的最大 tick 数
syncLimit=5
# 数据存储目录
dataDir=/home/hadoop/zookeeper/data
# 客户端连接的端口
clientPort=2181
```
#### HBase 
##### hbase-site.xml 
```xml
<?xml version="1.0"?>
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
