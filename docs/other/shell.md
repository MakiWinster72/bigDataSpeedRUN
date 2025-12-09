# Shell 脚本一键安装

由于时常需要重新安装，于是便动手写了一些 shell 命令，用于快速搭建实验环境。
请前往 [resources](../resources.md) 获取下载链接。

## hadoop 伪分布式

为节省时间可预先下载好安装包与 sh 脚本放与同一目录下。脚本内也提供了下载连接[resources](../resources.md)，若未检测到安装包会询问是否在线下载。
![111](https://img.makis-life.cn/images/20251110181116139.png)

> 从 windows 向虚拟机传输文件可参考 [sharedFolder](../lab1/sharedFolder.md)、[otherWaysTransferFile2VM](otherWaysTransferFileToVM.md)
> 为脚本赋予执行权限：

```bash
sudo chmod +x path/to/sh
# 例如sh文件放在home目录下
# sudo chmod +x ~/hadoopInstall.sh
```

![](https://img.makis-life.cn/images/20251110181116140.png)
运行 sh 文件

```bash
bash path/to/sh
# 例如 bash ~/hadoopInstall.sh
```

![](https://img.makis-life.cn/images/20251110181116141.png)
普通用户在运行步骤 1 后，需要将脚本移动到 hadoop 目录下执行

```bash
sudo mv * /home/hadoop/
su hadoop
sudo chmod ~/hadoopInstall.sh
```

然后直接选步骤 10 即可。

## hadoop 完全分布式
> 与集群搭建共用同一个shell脚本

为节省时间可预先下载好安装包与 sh 脚本放与同一目录下。脚本内也提供了下载连接，若未检测到安装包会询问是否在线下载[resources](../resources.md)。
![](https://img.makis-life.cn/images/20251110181116142.png)

> 从 windows 向虚拟机传输文件可参考 [sharedFolder](../lab1/sharedFolder.md)、[otherWaysTransferFile2VM](otherWaysTransferFileToVM.md)

```bash
chmod +x hadoopCluster.sh
bash hadoopCluster.sh
```
![](https://img.makis-life.cn/images/20251210060725963.png)
选择1235即可

在浏览器中打开http://localhost:9870

![](https://img.makis-life.cn/images/20251110181116146.png)

执行完后请手`source ~/.bashrc`或重新打开一个终端才能识别 hdfs 命令

## hbase

需要 hdfs 安装作为前提。

为节省时间可预先下载好安装包与 sh 脚本放与同一目录下。脚本内也提供了下载连接，若未检测到安装包会询问是否在线下载[resources](../resources.md)。

![](https://img.makis-life.cn/images/20251110181116147.png)

> 从 windows 向虚拟机传输文件可参考 [sharedFolder](../lab1/sharedFolder.md)、[otherWaysTransferFile2VM](otherWaysTransferFileToVM.md)

添加执行权限

```bash
sudo chmod +x path/to/hbaseInstall.sh
```

执行脚本

```bash
bash path/to/hbaseInstall.sh
```

会通过 echo $HADOOP_HOME 检测是否已经安装好 hdfs

![](https://img.makis-life.cn/images/20251110181116148.png)

如果刚安装 hadoop,运行 hbaseInstall 还是提示 HADOOP_HOME 未设置，请执行

```bash
source ~/.bashrc
```

![](https://img.makis-life.cn/images/20251110181116149.png)

输入 12,等待完成

![](https://img.makis-life.cn/images/20251110181116150.png)

执行完后请手`source ~/.bashrc`或重新打开一个终端

## 集群搭建

提前完成好
1. 获取各主机IP地址
2. 完成hadoop用户免密码执行sudo权限指令

修改相应数据
```bash
vim hadoopCluster.sh
```

![](https://img.makis-life.cn/images/20251210060725965.png)
按下i进入插入模式，修改为对应的数据即可。下方mysql无需提前设置
输入:wq保存并退出

准备好各安装包和脚本同一目录，若版本号不同记得在sh文件中修改后保存
```
packages
├── apache-hive-4.2.0-bin.tar.gz
├── apache-zookeeper-3.8.5-bin.tar.gz
├── hadoop-3.4.2.tar.gz
├── hadoopCluster.sh  # sh脚本
├── hbase-2.6.3-bin.tar.gz
├── openjdk-21_linux-x64_bin.tar.gz
├── scala-2.13.16.tgz
└── spark-4.0.1-bin-hadoop3.tgz
```

### 运行

```bash
chmod +x hadoopCluster.sh
bash hadoopCluster.sh
```
![](https://img.makis-life.cn/images/20251210060725966.png)