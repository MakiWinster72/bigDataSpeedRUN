> 避免网络问题，均使用国内镜像站下载。
# 系统
[阿里云](https://mirrors.aliyun.com/ubuntu-releases/)
可选择desktop或server进行安装。

[学生领取ECS服务器](freeECS.md)

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

# JAVA
[jdk8u202](https://mirrors.huaweicloud.com/java/jdk/8u202-b08/jdk-8u202-linux-x64.tar.gz)
```bash
wget https://mirrors.huaweicloud.com/java/jdk/8u202-b08/jdk-8u202-linux-x64.tar.gz
```
> Hbase目前对java11以上的支持并不太好
