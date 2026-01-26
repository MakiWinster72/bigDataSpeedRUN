## 系统

> 避免网络问题，均使用国内镜像站下载。

[阿里云](https://mirrors.aliyun.com/ubuntu-releases/)
可选择[desktop](<lab1/virtualMachine.md#Ubuntu Desktop>)或[server](<lab1/virtualMachine.md#Ubuntu Server>)进行安装。

### 服务器

> 活动具有时效性，不一定当前阿里云还有活动

[领取ECS服务器](other/freeECS.md)

### 云数据库

> 活动具有时效性，不一定当前阿里云还有活动

[领取RDS云数据库](other/freeRDS.md)


## 大数据组件

[Hadoop](https://mirrors.aliyun.com/apache/hadoop/common/?spm=a2c6h.25603864.0.0.9f0b506eJosOB1)

```bash
wget https://mirrors.aliyun.com/apache/hadoop/common/hadoop-3.4.2/hadoop-3.4.2.tar.gz
```

[HBase](https://mirrors.aliyun.com/apache/hbase/)

```bash
wget https://mirrors.aliyun.com/apache/hbase/2.6.4/hbase-2.6.4-bin.tar.gz
```

[zookeeper](https://mirrors.aliyun.com/apache/zookeeper/?spm=a2c6h.25603864.0.0.41393240wn0lkU)

```bash
wget https://mirrors.aliyun.com/apache/zookeeper/zookeeper-3.8.5/apache-zookeeper-3.8.5-bin.tar.gz
```

[hive](https://mirrors.aliyun.com/apache/hive/)
```bash
wget https://mirrors.aliyun.com/apache/hive/hive-standalone-metastore-4.2.0/hive-standalone-metastore-4.2.0-bin.tar.gz
```

[Spark](https://mirrors.aliyun.com/apache/spark/)
```bash
wget wget https://mirrors.aliyun.com/apache/spark/spark-4.0.1/spark-4.0.1-bin-hadoop3.tgz
```

[hive](https://mirrors.aliyun.com/apache/hive/)
```bash
wget https://mirrors.aliyun.com/apache/hive/hive-standalone-metastore-4.2.0/hive-standalone-metastore-4.2.0-bin.tar.gz
```

> 上述复制连接后，若为阿里云服务器，可更换为内网链接：
> ECS VPC网络访问地址: <http://mirrors.cloud.aliyuncs.com/>
> ECS 经典网络访问地址: <http://mirrors.aliyuncs.com/>

## JAVA

[华为镜像站](https://mirrors.huaweicloud.com/openjdk/)

```bash
wget https://mirrors.huaweicloud.com/java/jdk/11+28/jdk-11_linux-x64_bin.tar.gz
```

## Shell

[hadoop伪分布式](https://res.makis-life.cn/shared/hadoopInstall.sh)

```bash
wget https://res.makis-life.cn/shared/hadoopInstall.sh

chmod +x hadoopInstall.sh

bash hadoopInstall.sh
```

[hadooop完全分布式](https://res.makis-life.cn/shared/hadoopCluster.sh)

```bash
wget https://res.makis-life.cn/shared/hadoopCluster.sh

chmod +x hadoopCluster.sh

bash hadoopCluster.sh
```

[hbase](https://res.makis-life.cn/shared/hbaseInstall.sh)

```bash
wget https://res.makis-life.cn/shared/hbaseInstall.sh

chmod +x hbaseInstall.sh

bash hbaseInstall.sh
```
