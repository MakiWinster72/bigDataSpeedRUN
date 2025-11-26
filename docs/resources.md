# Shell
[hadoop伪分布式](https://res.makis-life.cn/shared/hadoopInstall.sh)
```bash
wget https://res.makis-life.cn/shared/hadoopInstall.sh
chmod +x hadoopInstall.sh
./hadoopInstall.sh
```

[hadooop完全分布式](https://res.makis-life.cn/shared/hadoopCluster.sh)
```bash
wget https://res.makis-life.cn/shared/hadoopCluster.sh
chmod +x hadoopCluster.sh
./hadoopCluster.sh
```

[hbase](https://res.makis-life.cn/shared/hbaseInstall.sh)
```bash
wget https://res.makis-life.cn/shared/hbaseInstall.sh
chmod +x hbaseInstall.sh
./hbaseInstall.sh
```

---
# 系统

> 避免网络问题，均使用国内镜像站下载。

[阿里云](https://mirrors.aliyun.com/ubuntu-releases/)
可选择[desktop](<lab1/virtualMachine.md#Ubuntu Desktop>)或[server](<lab1/virtualMachine.md#Ubuntu Server>)进行安装。

### 服务器
[领取ECS服务器](other/freeECS.md)

### 云数据库
[领取RDS云数据库](other/freeRDS.md)

---

# 大数据组件
[Hadoop 3.4.2](https://mirrors.aliyun.com/apache/hadoop/common/hadoop-3.4.2/hadoop-3.4.2.tar.gz)
```bash
wget https://mirrors.aliyun.com/apache/hadoop/common/hadoop-3.4.2/hadoop-3.4.2.tar.gz
```

[HBase 2.6.3](https://mirrors.aliyun.com/apache/hbase/2.6.3/hbase-2.6.3-bin.tar.gz)
```bash
wget https://mirrors.aliyun.com/apache/hbase/2.6.3/hbase-2.6.3-bin.tar.gz
```

[ZooKeeper 3.8.5](https://mirrors.aliyun.com/apache/zookeeper/zookeeper-3.8.5/apache-zookeeper-3.8.5-bin.tar.gz)
```bash
wget https://mirrors.aliyun.com/apache/zookeeper/zookeeper-3.8.5/apache-zookeeper-3.8.5-bin.tar.gz
```

>上述复制连接后，若为阿里云服务器，可更换为内网链接：
>ECS VPC网络访问地址: http://mirrors.cloud.aliyuncs.com/
>ECS 经典网络访问地址: http://mirrors.aliyuncs.com/

---

# JAVA
[jdk11](https://mirrors.huaweicloud.com/java/jdk/11+28/jdk-11_linux-x64_bin.tar.gz)
```bash
wget https://mirrors.huaweicloud.com/java/jdk/11+28/jdk-11_linux-x64_bin.tar.gz
```
