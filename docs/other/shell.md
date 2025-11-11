# Shell 脚本一键安装

由于时常需要重新安装，于是便动手写了一些shell命令，用于快速搭建实验环境。
请前往 [resources](../resources.md) 获取下载链接。
## hadoop伪分布式
为节省时间可预先下载好安装包与sh脚本放与同一目录下。脚本内也提供了下载连接[resources](../resources.md)，若未检测到安装包会询问是否在线下载。
![111](https://img.makis-life.cn/images/20251110181116139.png)
> 从windows向虚拟机传输文件可参考 [sharedFolder](../lab1/sharedFolder.md)、[otherWaysTransferFile2VM](../lab1/otherWaysTransferFileToVM.md)
为脚本赋予执行权限：
```bash
sudo chmod +x path/to/sh
# 例如sh文件放在home目录下
# sudo chmod +x ~/hadoopInstall.sh
```
![](https://img.makis-life.cn/images/20251110181116140.png)
运行sh文件
```bash
bash path/to/sh
# 例如 bash ~/hadoopInstall.sh
```
![](https://img.makis-life.cn/images/20251110181116141.png)
普通用户在运行步骤1后，需要将脚本移动到hadoop目录下执行
```bash
sudo mv * /home/hadoop/
su hadoop
sudo chmod ~/hadoopInstall.sh
```
然后直接选步骤10即可。
## hadoop完全分布式
为节省时间可预先下载好安装包与sh脚本放与同一目录下。脚本内也提供了下载连接，若未检测到安装包会询问是否在线下载[resources](../resources.md)。
![](https://img.makis-life.cn/images/20251110181116142.png)
> 从windows向虚拟机传输文件可参考 [sharedFolder](../lab1/sharedFolder.md)、[otherWaysTransferFile2VM](../lab1/otherWaysTransferFileToVM.md)

### .env文件

在脚本同目录下，创建一`.env`文件

```bash
vim .env
```

内容入下：

```bash
CURRENT_USER_PASSWORD="123456" #当前用户密码（注意所有节点应当使用相同的用户名和密码）
MASTER_IP="192.168.1.100" # Master下用 ip addr show查看
SLAVE_COUNT=2 # 指定具体整数，与下方ip个数一致
SLAVE_IPS_STR="IPv4,IPv4"
HADOOP_PASSWORD="123456" # hadoop用户的密码
```

### 执行文件

```bash
bash ~/hadoopCluster.sh  # 记得chmod +x hadoopCluster.sh添加权限
```

会提示你检查信息是否有问题

![](https://img.makis-life.cn/images/20251110181116143.png)

输入1后

sit back, relax, enjoy the show

![](https://img.makis-life.cn/images/20251110181116144.png)

完成后将提示

![](https://img.makis-life.cn/images/20251110181116145.png)

点击链接即可自动在浏览器中打开

![](https://img.makis-life.cn/images/20251110181116146.png)

执行完后请手`source ~/.bashrc`或重新打开一个终端才能识别hdfs命令

## hbase

需要hdfs安装作为前提。

为节省时间可预先下载好安装包与sh脚本放与同一目录下。脚本内也提供了下载连接，若未检测到安装包会询问是否在线下载[resources](../resources.md)。

![](https://img.makis-life.cn/images/20251110181116147.png)

> 从windows向虚拟机传输文件可参考 [sharedFolder](../lab1/sharedFolder.md)、[otherWaysTransferFile2VM](../lab1/otherWaysTransferFileToVM.md)

添加执行权限

```bash
sudo chmod +x path/to/hbaseInstall.sh
```

执行脚本

```bash
bash path/to/hbaseInstall.sh
```

会通过echo $HADOOP_HOME检测是否已经安装好hdfs

![](https://img.makis-life.cn/images/20251110181116148.png)

如果刚安装hadoop,运行hbaseInstall还是提示HADOOP_HOME未设置，请执行

```bash
source ~/.bashrc
```

![](https://img.makis-life.cn/images/20251110181116149.png)

输入12,等待完成

![](https://img.makis-life.cn/images/20251110181116150.png)

执行完后请手`source ~/.bashrc`或重新打开一个终端