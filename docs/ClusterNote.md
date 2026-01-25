## 实验设备

### 硬件

| 设备名             | 数量 | 备注                             |
| ------------------ | ---- | -------------------------------- |
| 计算机<br>         | 4    | 成员设备，用于运行 ubuntu 虚拟机 |
| 路由器：HUAWEI AX6 | 1    | 通信设备，用于为各主机建立连接   |

> 单计算机多虚拟机也可以，服务器也可以，全服务器也可以。核心是通过ip通信，服务器建议各主机在同一个vps网络中。

### 软件

| 软件名称      | 版本        |
| ------------- | ----------- |
| Ubuntu 虚拟机 | 24.04.4 LTS |
| Hadoop        | 3.4.2       |
| HBase         | 2.6.3       |
| Hive          | 4.2.0       |
| Zookeeper     | 3.8.5       |
| Spark         | 4.0.1       |
| Scala         | 2.13.16     |
| OpenJDK       | 21          |

## 实验步骤

### 环境准备

#### 允许 hadoop 免密码 sudo

> 主要为了后续 master 可直接远程 ssh Slaves 主机时使用sudo无需密码。
> 也可选择配置允许远程 root 登录

在 master 和 slave1 ～ 3 都执行

```bash
sudo visudo
```

会用 nano 编辑 sudoers
新增一行

```
hadoop ALL=(ALL) NOPASSWD: ALL
```

![](https://img.makis-life.cn/images/20251210053415876.png?x-oss-process=style/yasuo)

#### 通信

四台主机全部接入路由器，即均处于同一局域网中，从而实现主机间通信。

令虚拟机处于桥接模式，在 Ubuntu 中使用 `ip addr show` 查看 ip 地址

例如：

![](https://img.makis-life.cn/images/20251210053415878.png?x-oss-process=style/yasuo)

<center>检查 Master 的 IP 地址</center>

其中 enp0s3 是当前所使用的网卡，可知目前 ipv4 地址为 192.168.1.101。

获取到四台虚拟机的 IP 地址如下

| 主机   | IPv4          |
| ------ | ------------- |
| Master | 192.168.1.104 |
| Slave1 | 192.168.1.102 |
| Slave2 | 192.168.1.101 |
| Slave3 | 192.168.1.105 |

##### 检查连通性

虚拟机间互 ping，检验不同主机间虚拟机是否可以正常通信

1. 登录 master

```
ssh hadoop@192.168.1.104
ping 192.168.1.102 -c 3
ping 192...（各 Slaves 的ip地址）
```

![](https://img.makis-life.cn/images/20251210053415879.png?x-oss-process=style/yasuo)

#### 编辑 hosts 文件

```bash
sudo nvim /etc/hosts
```

![](https://img.makis-life.cn/images/20251210053415880.png?x-oss-process=style/yasuo)

将 hosts 文件传递给各主机

```bash
scp /etc/hosts hadoop@master:~
scp /etc/hosts hadoop@slave1:～
...
```

![](https://img.makis-life.cn/images/20251210053415881.png?x-oss-process=style/yasuo)

#### 设置主机名

```bash
sudo hostnamectl set-hostname master
```

![](https://img.makis-life.cn/images/20251210053415882.png?x-oss-process=style/yasuo)

<center>Master 设置主机名</center>

可见，再次输入`bash`，即刷新当前 SHELL，可以看见前面已经变为 hadoop@master，方便辨认 master 和 slaves

更改各主机名
![](https://img.makis-life.cn/images/20251210053415883.png?x-oss-process=style/yasuo)
通过 ssh 为各主机执行命令
此处 sudo 已经不再需要密码，因为第一步已经允许 hadoop 用户免密码执行 sudo 权限指令

#### run.sh 脚本

> 可见上述经常有 ssh 或 scp 步骤，对于 slave1/slave2/slave3 是完全一致的，为减少重复的指令输入，我们写了一个 sh 脚本：

```sh
#!/bin/bash

# 定义所有 slave
SLAVES=("slave1" "slave2" "slave3")

TARGET=$1 # slaves 或者具体某个 slave
ACTION=$2 # ssh / scp
shift 2   # 去掉前两个参数，剩下的是命令或路径

if [ "$TARGET" == "slaves" ]; then
  HOSTS=("${SLAVES[@]}")
else
  HOSTS=("$TARGET")
fi

for HOST in "${HOSTS[@]}"; do
  echo "正在处理 $HOST ..."

  if [ "$ACTION" == "ssh" ]; then
    # 组合剩余参数为命令
    CMD="$*"
    # 使用登录 shell (-l) 执行命令
    ssh -t hadoop@"$HOST" "bash -l -c '$CMD'"
  elif [ "$ACTION" == "scp" ]; then
    # scp 命令需要两个参数：本地文件/目录 和 远程路径
    LOCAL="$1"
    REMOTE="$2"
    scp -rq "$LOCAL" hadoop@"$HOST":"$REMOTE"
  else
    echo "不支持的操作: $ACTION"
  fi

  echo "$HOST 完成"
done
```

例如，我们要在 slave1 和 2 和 3 上创建/usr/lib/jvm 文件夹，只需要

```bash
./run.sh slaves ssh "sudo mkdir /usr/lib/jvm"
```

即可。

### 配置 ssh 免密码登录

hadoop 集群需要 ssh 免密码登录才可正常运行

> 并且上述可见，即使已经配置了 hadoop 免密 sudo 权限，但是远程登录依然需要密码，Slaves 多了非常麻烦。配置 ssh 免密码登录可减少输入密码的步骤。

#### 在 master 节点执行

```bash
# 生成密钥对
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
```

![](https://img.makis-life.cn/images/20251210053415884.png?x-oss-process=style/yasuo)

#### 分发密钥

```bash
# 复制公钥到所有节点（包括自己）
ssh-copy-id -i ~/.ssh/id_rsa.pub master
ssh-copy-id -i ~/.ssh/id_rsa.pub slave1
ssh-copy-id -i ~/.ssh/id_rsa.pub slave2
ssh-copy-id -i ~/.ssh/id_rsa.pub slave3
```

会依次询问是否添加主机以及对应主机的密码。
![](https://img.makis-life.cn/images/20251210053415885.png?x-oss-process=style/yasuo)

```bash
# 测试免密登录
ssh master
ssh slave1
ssh slave2
ssh slave3
```

可见现在 ssh slave1 已经不再需要输入密码，免登录设置成功。
![](https://img.makis-life.cn/images/20251210053415886.png?x-oss-process=style/yasuo)

### 安装 Java

#### 下载

前往[华为 Openjdk](https://mirrors.huaweicloud.com/openjdk/)
或 wget 下载

```bash
wget https://mirrors.huaweicloud.com/openjdk/21/openjdk-21_linux-x64_bin.tar.gz
```

#### 安装

```bash
tar -xzf openjdk(按下tab)
sudo mkdir /usr/lib/jvm
sudo mv jdk-21 /usr/lib/jvm/jdk21   # 常见jdk都安装在这里，也可自己选定地方
```

编辑`~/.profile`文件，写入 JAVA_HOME

```bash
# JAVA
export JAVA_HOME=/usr/lib/jvm/jdk21
export PATH=$JAVA_HOME/bin:$PATH
```

![](https://img.makis-life.cn/images/20251210053415887.png?x-oss-process=style/yasuo)

检验 java 是否安装成功
![](https://img.makis-life.cn/images/20251210053415888.png?x-oss-process=style/yasuo)

#### 分发 java 并安装

```bash
./run.sh slaves scp /usr/lib/jvm/jdk21 ~   # 分发jdk21到用户home目录
./run.sh slaves ssh "sudo mkdir -p /usr/lib/jvm"  # 创建jvm文件夹
./run.sh slaves ssh "sudo mv ~/jdk21 /usr/lib/jvm/jdk21"  # 移动jdk21到jvm目录
./run.sh slaves scp ~/.profile ~/.profile  # 分发.profile文件
```

检查各个主机是否成功安装 java
![](https://img.makis-life.cn/images/20251210053415889.png?x-oss-process=style/yasuo)

### 安装 zookeeper

#### 下载

前往[阿里云镜像站](https://mirrors.aliyun.com/apache/zookeeper/zookeeper-3.8.5/?spm=a2c6h.25603864.0.0.53226961zXU2VX)或 wget 下载

```bash
wget https://mirrors.aliyun.com/apache/zookeeper/zookeeper-3.8.5/apache-zookeeper-3.8.5-bin.tar.gz
```

将本地 zookeeper 安装包发送给 master

```bash
scp 安装包路径 hadoop@master:~   # Windows 使用winscp
```

![](https://img.makis-life.cn/images/20251210053415890.png?x-oss-process=style/yasuo)

在 master 上安装 zookeeper

```bash
tar -xzf apac(按下tab)
sudo mv apac(按下tab) /usr/local/zookeeper
sudo chown -R hadoop:hadoop /usr/local/zookeeper   # 改变文件所属用户
```

> [!warning]
> 如果你的用户不叫 hadoop，可以用`whoami`得知用户名，当然，可以把上述指令换成
> sudo chown -R $(whoami):$(whoami) /usr/local/zookeeper

![](https://img.makis-life.cn/images/20251210053415891.png?x-oss-process=style/yasuo)

创建工作目录

```bash
sudo mkdir -p /usr/local/zookeeper/data
sudo mkdir -p /usr/local/zookeeper/logs
```

#### 配置 ZooKeeper

![](https://img.makis-life.cn/images/20251210053415892.png?x-oss-process=style/yasuo)

修改内容:

```properties
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/usr/local/zookeeper/data
dataLogDir=/usr/local/zookeeper/logs
clientPort=2181

# 集群配置
server.1=master:2888:3888
server.2=slave1:2888:3888
server.3=slave2:2888:3888
server.4=slave3:2888:3888
```

![](https://img.makis-life.cn/images/20251210053415893.png?x-oss-process=style/yasuo)

#### 分发 ZooKeeper 到 Slave 节点

```bash
./run.sh scp /usr/local/zookeeper ~
```

#### Slaves 节点安装 ZooKeeper

![](https://img.makis-life.cn/images/20251210053415894.png?x-oss-process=style/yasuo)

设置各节点的 myid
master -> 1, Slave1 -> 2, Slave2 -> 3, Slave3 -> 4

```bash
./run.sh slaves ssh "cat /usr/local/zookeeper/data/myid"
```

![](https://img.makis-life.cn/images/20251210053415895.png?x-oss-process=style/yasuo)

检验是否配置成功
![](https://img.makis-life.cn/images/20251210053415896.png?x-oss-process=style/yasuo)

#### 更新环境变量

编辑`~/.profile`
![](https://img.makis-life.cn/images/20251210053415897.png?x-oss-process=style/yasuo)
分发`~/.profile`

```bash
./run.sh slaves scp ~/.profile ~/.profile
```

![](https://img.makis-life.cn/images/20251210053415898.png?x-oss-process=style/yasuo)

#### 启动 zookeeper

```bash
zkServer.sh start
```

![](https://img.makis-life.cn/images/20251210053415899.png?x-oss-process=style/yasuo)

#### 检查 ZooKeeper 集群状态

```bash
zkServer.sh status
```

![](https://img.makis-life.cn/images/20251210053415900.png?x-oss-process=style/yasuo)
可以看见，Slave2 被选中成为 leader,其余为 follower。

> [!note] 🎉
> 至此，zookeeper 集群搭建完成。

### 安装 Hadoop 集群

#### 将本地 hadoop 安装包发送给 master

```bash
scp hadoop-3.4.2.tar.gz hadoop@master:~
```

#### master 安装 hadoop

![](https://img.makis-life.cn/images/20251210053415901.png?x-oss-process=style/yasuo)

#### 创建工作环境

```bash
sudo mkdir -p /usr/local/hadoop/tmp
sudo mkdir -p /usr/local/hadoop/hdfs/name
sudo mkdir -p /usr/local/hadoop/hdfs/data
sudo chown -R $USER:$USER /usr/local/hadoop
```

#### 配置 Hadoop 环境

编辑`~/.profile`，新增：

```profile
# HADOOP
export HADOOP_HOME=/usr/local/hadoop
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export HADOOP_YARN_HOME=$HADOOP_HOME
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
export CLASSPATH=$CLASSPATH:$HADOOP_HOME/lib
export PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin
```

目前 `~/.profile` 状态
![](https://img.makis-life.cn/images/20251210053415902.png?x-oss-process=style/yasuo)

#### 配置 Hadoop 各组件

| 组件名    | 配置文件名      |
| --------- | --------------- |
| common    | core-site.xml   |
| HDFS      | hdfs-site.xml   |
| MapReduce | mapred-site.xml |
| YARN      | yarn-site.xml   |

```bash
cd $HADOOP_HOME/etc/hadoop
nvim hadoop-env.sh
```

找到`export JAVA_HOME=`行，若使用 vim 可使用/进入搜索模式
![](https://img.makis-life.cn/images/20251210053415903.png?x-oss-process=style/yasuo)
同样，编辑`yarn-env.sh`添加 JAVA_HOME，若找不到 JAVA_HOME 行则新增即可

#### 配置 core-site.xml

```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://master:9000</value>
    </property>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/usr/local/hadoop/tmp</value>
    </property>
    <property>
        <name>hadoop.http.staticuser.user</name>
        <value>root</value>
    </property>
</configuration>
```

#### 配置 hdfs-site.xml

```xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>3</value>
    </property>
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>/usr/local/hadoop/hdfs/name</value>
    </property>
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>/usr/local/hadoop/hdfs/data</value>
    </property>
    <property>
        <name>dfs.namenode.http-address</name>
        <value>master:9870</value>
    </property>
    <property>
        <name>dfs.namenode.secondary.http-address</name>
        <value>master:9868</value>
    </property>
</configuration>

```

#### 配置 yarn-site.xml

```xml
<configuration>
    <property>
        <name>yarn.resourcemanager.hostname</name>
        <value>master</value>
    </property>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.env-whitelist</name>
        <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,HADOOP_YARN_HOME,HADOOP_HOME,PATH</value>
    </property>
</configuration>
```

#### 配置 mapred-site.xml

```xml
<configuration>
    <property>
        <!--指定Mapreduce运行在yarn上-->
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
    <property>
        <name>mapreduce.application.classpath</name>
        <value>$HADOOP_HOME/share/hadoop/mapreduce/*:$HADOOP_HOME/share/hadoop/mapreduce/lib/*</value>
    </property>
    <property>
        <name>yarn.app.mapreduce.am.env</name>
        <value>HADOOP_MAPRED_HOME=${HADOOP_HOME}</value>
    </property>
    <property>
        <name>mapreduce.map.env</name>
        <value>HADOOP_MAPRED_HOME=${HADOOP_HOME}</value>
    </property>
    <property>
        <name>mapreduce.reduce.env</name>
        <value>HADOOP_MAPRED_HOME=${HADOOP_HOME}</value>
    </property>
</configuration>
```

#### **配置 workers 文件:**

```bash
vim $HADOOP_HOME/etc/hadoop/workers
```

内容:

```
slave1
slave2
slave3
```

#### 更新环境变量，分发 hadoop

```bash
./run.sh slaves scp ~/.profile ~/.profile    # 分发profile
./run.sh slaves ssh "source ~/.profile && echo $HADOOP_HOME"  # 检查是否分发成功
./run.sh slaves scp /usr/local/hadoop ~   # 分发hadoop
./run.sh slaves ssh "sudo mv ~/hadoop /usr/local/hadoop"  # 移动到/usr/local文件夹
```

![](https://img.makis-life.cn/images/20251210053415904.png?x-oss-process=style/yasuo)
![](https://img.makis-life.cn/images/20251210053415905.png?x-oss-process=style/yasuo)

#### 格式化 namenode

在 master 上

```bash
hadoop namenode -format
```

![](https://img.makis-life.cn/images/20251210053415906.png?x-oss-process=style/yasuo)
![](https://img.makis-life.cn/images/20251210053415907.png?x-oss-process=style/yasuo)

#### 在 master 中启动 hadoop

```bash
start-dfs.sh
start-yarn.sh

# 或 start-all.sh （已过时）
```

![](https://img.makis-life.cn/images/20251210053415908.png?x-oss-process=style/yasuo)

#### 检查各节点 jps

master
![](https://img.makis-life.cn/images/20251210053415909.png?x-oss-process=style/yasuo)

slaves
![](https://img.makis-life.cn/images/20251210053415910.png?x-oss-process=style/yasuo)

#### 访问 hadoopWeb

浏览器访问 <http://master:9870> ，查看 datanode
![](https://img.makis-life.cn/images/20251210053415911.png?x-oss-process=style/yasuo)
可以看见 Slaves 们的数据。

> [!note] 🎉
> 至此，hadoop 集群搭建成功。

### 安装 HBase 集群

#### 下载

前往[阿里云镜像站](https://mirrors.aliyun.com/apache/hbase/)或 wget 下载

```bash
wget https://mirrors.aliyun.com/apache/hbase/2.6.4/hbase-2.6.4-bin.tar.gz
```

将 hbase 安装包发送到 master 上
![](https://img.makis-life.cn/images/20251210053415912.png?x-oss-process=style/yasuo)

#### 安装

解压并安装 hbase
![](https://img.makis-life.cn/images/20251210053415913.png?x-oss-process=style/yasuo)
编辑 hbase-env.sh

```bash
nvim /usr/local/hbase/conf/hbase.env.sh
```

查找或直接在文件头新增以下四行

```bash
export HBASE_MANAGES_ZK=false
export JAVA_HOME=/usr/lib/jvm/jdk21
export HBASE_CLASSPATH=/usr/local/hadoop/etc/hadoop
export HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP="true"
```

![](https://img.makis-life.cn/images/20251210053415914.png?x-oss-process=style/yasuo)
**复制 Hadoop 配置文件:**

```bash
cp $HADOOP_HOME/etc/hadoop/core-site.xml $HBASE_HOME/conf/
cp $HADOOP_HOME/etc/hadoop/hdfs-site.xml $HBASE_HOME/conf/
```

**配置 hbase-site.xml:**

```bash
vim $HBASE_HOME/conf/hbase-site.xml
```

内容:

```xml
<configuration>
    <property>
        <name>hbase.rootdir</name>
        <value>hdfs://master:9000/hbase</value>
    </property>
    <property>
        <name>hbase.cluster.distributed</name>
        <value>true</value>
    </property>
    <property>
        <name>hbase.zookeeper.quorum</name>
    <!-- 这里对应好Slaves的数量 -->
        <value>master,slave1,slave2,slave3</value>
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
    <property>
        <name>hbase.master.info.port</name>
        <value>16010</value>
    </property>
</configuration>
```

**配置 regionservers:**

```bash
vim $HBASE_HOME/conf/regionservers
```

内容:
![](https://img.makis-life.cn/images/20251210053415915.png?x-oss-process=style/yasuo)

#### 分发 HBase

```bash
./run.sh slaves scp /usr/local/hbase ~
```

![](https://img.makis-life.cn/images/20251210053415916.png?x-oss-process=style/yasuo)

安装 hbase 到`/usr/local/hbase`
![](https://img.makis-life.cn/images/20251210053415917.png?x-oss-process=style/yasuo)

#### 分发 profile 并检查

![](https://img.makis-life.cn/images/20251210053415918.png?x-oss-process=style/yasuo)

#### 启动 HBase

确保 hadoop 和 zookeeper 已经开启。

```
start-hbase.sh
```

浏览器访问 <https://master:16010>
![](https://img.makis-life.cn/images/20251210053415919.png?x-oss-process=style/yasuo)
可以看见有三个 slave 节点

**jps**
![](https://img.makis-life.cn/images/20251210053415920.png?x-oss-process=style/yasuo)
![](https://img.makis-life.cn/images/20251210053415921.png?x-oss-process=style/yasuo)

#### 测试 HBase

```bash
# 查看进程
jps
# Master应该看到: HMaster
# Slave应该看到: HRegionServer

# 进入HBase Shell
hbase shell

# 创建测试表
create 'test', 'cf'

# 插入数据
put 'test', 'row1', 'cf:name', 'zhangsan'
put 'test', 'row1', 'cf:age', '25'

# 查询数据
scan 'test'
get 'test', 'row1'

# 退出
exit
```

![](https://img.makis-life.cn/images/20251210053415922.png?x-oss-process=style/yasuo)
上图可以看见，status 显示一个活跃的 master 节点，三个 server 节点。

创建表后，在 web 界面可以看见新建的表
![](https://img.makis-life.cn/images/20251210053415923.png?x-oss-process=style/yasuo)

> [!note] 🎉
> 至此，HBase 集群搭建成功！

### 安装 Hive

#### 下载

前往[阿里云镜像站](https://mirrors.aliyun.com/apache/hive/?spm=a2c6h.25603864.0.0.23f63123S7PuMA)或 wget 下载

```bash
wget https://mirrors.aliyun.com/apache/hive/hive-4.2.0/apache-hive-4.2.0-bin.tar.gz
```

#### 安装 Hive

```bash
tar -xzf 安装包
sudo mv 安装包 /usr/local/hive
sudo chown -R hadoop:hadoop /usr/local/hive
```

![](https://img.makis-life.cn/images/20251210053415924.png?x-oss-process=style/yasuo)

删除和 hadoop 重复的 slf4j 包

```bash
rm $HIVE_HOME/lib/log4j-slf4j-impl-2.24.3.jar
```

检查 hive 和 hadoop 的 `guava` 包，删除低版本并把高版本复制过去

```bash
ls $HIVE_HOME/lib | grep guava
ls $HADOOP_HOME/share/hadoop/common/lib/ | grep guava
```

![](https://img.makis-life.cn/images/20251210053415925.png?x-oss-process=style/yasuo)
这里 hadoop 的版本比 hive 高，所以删除 hive，并把 hadoop 的 guava 复制过去
![](https://img.makis-life.cn/images/20251210053415926.png?x-oss-process=style/yasuo)

更新环境变量
编辑`~/.profile~

```bash
export HIVE_HOME=/usr/local/hive
export PATH=$PATH:$HIVE_HOME/bin
```

目前 profile 状态
![](https://img.makis-life.cn/images/20251210053415927.png?x-oss-process=style/yasuo)

应用 profile

```bash
source ~/.profile
```

#### 分发并检验`profile`

```bash
./run.sh slaves scp ~/.profile ~/.profile
./run.sh slaves ssh "source ~/.profile && echo $HIVE_HOME"
```

![](https://img.makis-life.cn/images/20251210053415928.png?x-oss-process=style/yasuo)

#### 配置 hive-site

**修改`/usr/local/hive/conf`下的 hive-site.xml**
进入 hive 配置文件夹，把`hive-default.xml.template`拷贝一份为`hive-default.xml`
然后新建一个`hive-site.xml`文件
![](https://img.makis-life.cn/images/20251210053415929.png?x-oss-process=style/yasuo)

内容如下

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>javax.jdo.option.ConnectionURL</name>
    <value>jdbc:mysql://localhost:3306/hive?createDatabaseIfNotExist=true</value>
    <description>JDBC connect string for a JDBC metastore</description>
  </property>
  <property>
    <name>javax.jdo.option.ConnectionDriverName</name>
    <value>com.mysql.cj.jdbc.Driver</value>
    <description>Driver class name for a JDBC metastore</description>
  </property>
  <property>
    <name>javax.jdo.option.ConnectionUserName</name>
    <value>hive</value>
    <description>username to use against metastore database</description>
  </property>
  <property>
    <name>javax.jdo.option.ConnectionPassword</name>
    <value>hive</value>
    <description>password to use against metastore database</description>
  </property>
</configuration>
```

在`nvim $HADOOP_HOME/etc/hadoop/core-site.xml`新增

```xml
<property>
  <name>hadoop.proxyuser.hadoop.hosts</name>
  <value>*</value>
</property>
<property>
  <name>hadoop.proxyuser.hadoop.groups</name>
  <value>*</value>
</property>
```

上面 hadoop 对应用户名。
重启 hdfs

```bash
stop-all.sh && sleep 60 && start-all.sh
```

#### Master 安装 MySQL

> 也可在 Slave 安装，在上述的 hive-site 中配置好 jdbc 即可

更新软件包

```bash
sudo apt update
```

安装 mysql

```bash
sudo apt install mysql-server -y
```

下载 jdbc

```bash
wget https://mirrors.aliyun.com/mysql/Connector-J/mysql-connector-java-8.0.29.tar.gz
```

解压并复制到 hive 库

```bash
tar -xzf mysql-connector-java-8.0.29.tar.gz
cp mysql-connector-java-8.0.29/mysql-connector-java-8.0.29.jar /usr/local/hive/lib
```

![](https://img.makis-life.cn/images/20251210053415930.png?x-oss-process=style/yasuo)

##### 启动并登录 mysql

```bash
sudo systemctl start mysql
```

##### 检查 mysql 状态

```bash
sudo systemctl status mysql
```

![](https://img.makis-life.cn/images/20251210053415931.png?x-oss-process=style/yasuo)
可见 mysql 处于 running 状态

##### 登录 mysql

```bash
sudo mysql
```

新建 hive 数据库

```sql
CREATE DATABASE hive;
```

新建一个允许 localhost 连接的 hive 用户，并赋予它所有数据库的所有表的权限

```sql
CREATE USER 'hive'@'localhost' IDENTIFIED BY 'hive';
GRANT ALL PRIVILEGES ON *.* TO 'hive'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

这里的账号密码，要和`hive-site.xml`对应

#### 初始化元数据库

```bash
cd $HIVE_HOME/bin
./schematool -dbType mysql -initSchema
```

![](https://img.makis-life.cn/images/20251210053415932.png?x-oss-process=style/yasuo)

#### 启动 hive

> 需要先启动 hdfs

```bash
hive
```

![](https://img.makis-life.cn/images/20251210053415933.png?x-oss-process=style/yasuo)
成功进入 beeline
退出：`Ctrl + C`

##### 检验 Hive 是否正确搭建

创建文件

```
vim ~/test
```

```
1,jessie
2,winster
3,john
```

进入 hive 交互界面

```
hive
```

连接 hive

```hive
!connect jdbc:hive2://localhost:10000
# 然后输入hive-site里面的账号密码
```

![](https://img.makis-life.cn/images/20251210053415934.png?x-oss-process=style/yasuo)

创建表格

```hive
create table test(
   > id int,name string
   > )
   > row format delimited
   > fields terminated by ',';
```

执行成功
![](https://img.makis-life.cn/images/20251210053415935.png?x-oss-process=style/yasuo)

查看表格

```sql
SHOW TABLES;
DESCRIBE test;
```

![](https://img.makis-life.cn/images/20251210053415936.png?x-oss-process=style/yasuo)
![](https://img.makis-life.cn/images/20251210053415937.png?x-oss-process=style/yasuo)

加载刚才的 test 文件

```sql
LOAD DATA LOCAL INPATH '/home/hadoop/test' INTO TABLE test;
```

查看是否导入成功

```sql
SELECT * FROM test;
```

![](https://img.makis-life.cn/images/20251210053415938.png?x-oss-process=style/yasuo)

> [!note] 🎉
> 至此 hive 安装完成

### 安装 scala

#### 下载

[阿里云镜像站](https://mirrors.aliyun.com/macports/distfiles/scala/)或 wget 下载 scala

```bash
wget https://mirrors.aliyun.com/macports/distfiles/scala/scala-2.13.16.tgz?spm=a2c6h.25603864.0.0.1cd95fc6zmb1CB
```

#### 安装

```bash
tar -xzf scala安装包
sudo mv scala(tab) /usr/local/scala
sudo chown -R hadoop:hadoop /usr/local/scala
```

更新 profile

```bash
# SCALA
export SCALA_HOME=/usr/local/scala
export PATH=$SCALA_HOME/bin:$PATH
```

目前 profile 状态
![](https://img.makis-life.cn/images/20251210053415939.png?x-oss-process=style/yasuo)
`source ~/.profile` 并分发

#### 分发 Scala

```bash
./run.sh slaves scp $SCALA_HOME ~
./run.sh slaves ssh "sudo mv ~/scala /usr/local/scala"
```

![](https://img.makis-life.cn/images/20251210053415940.png?x-oss-process=style/yasuo)

### 安装 Spark

#### 下载 spark

[阿里云镜像站](https://mirrors.aliyun.com/apache/spark/spark-4.0.1/spark-4.0.1-bin-hadoop3.tgz)
或 wget 下载

```bash
wget https://mirrors.aliyun.com/apache/spark/spark-4.0.1/spark-4.0.1-bin-hadoop3.tgz
```

解压并安装

```bash
tar -xzf spark(tab)
sudo mv spark(tab) /usr/local/spark
sudo chown -R hadoop:hadoop /usr/local/spark
```

配置 spark

```bash
cd /usr/local/spark/conf
cp spark-env.sh.template spark-env.sh
vim spark-env.sh
```

内容:

```bash
#!/usr/bin/env bash

# ----------------------------
# Java & Scala 环境
# ----------------------------
export JAVA_HOME=/usr/lib/jvm/jdk21
export SCALA_HOME=/usr/local/scala
export PATH=$JAVA_HOME/bin:$SCALA_HOME/bin:$PATH

# ----------------------------
# Hadoop 环境
# ----------------------------
export HADOOP_HOME=/usr/local/hadoop
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
export YARN_CONF_DIR=$HADOOP_HOME/etc/hadoop

# ----------------------------
# Spark Master 配置
# ----------------------------
export SPARK_MASTER_HOST=master        # Master 主机名或 IP
export SPARK_MASTER_PORT=7077          # Master 通信端口
export SPARK_MASTER_WEBUI_PORT=8080    # Master Web UI 端口
export SPARK_DAEMON_MEMORY=1g          # Master、Worker 和 History Server 自身占用内存

# ----------------------------
# Spark Worker 配置
# ----------------------------
export SPARK_WORKER_CORES=4            # 每个 Worker 分配的 CPU 核数
export SPARK_WORKER_MEMORY=2g          # 每个 Worker 分配的总内存
export SPARK_WORKER_DIR=/data/spark    # Worker 临时目录
export SPARK_WORKER_PORT=7078
export SPARK_WORKER_WEBUI_PORT=8081

# ----------------------------
# Spark 通用资源配置
# ----------------------------
export SPARK_LOCAL_DIRS=/data/spark/local     # Shuffle 和 RDD 存储目录
export SPARK_CONF_DIR=$SPARK_HOME/conf
export SPARK_LOG_DIR=$SPARK_HOME/logs
export SPARK_PID_DIR=/tmp

# ----------------------------
# Spark Driver / Executor 配置
# ----------------------------
export SPARK_EXECUTOR_CORES=2
export SPARK_EXECUTOR_MEMORY=2g
export SPARK_DRIVER_MEMORY=1g

# ----------------------------
# Beeline 配置
# ----------------------------
export SPARK_BEELINE_MEMORY=1g
```

修改 slaves 文件

```bash
cp workers.template workers
vim workers
```

![](https://img.makis-life.cn/images/20251210053415941.png?x-oss-process=style/yasuo)

#### 更新环境变量

```bash
vim ~/.profile
```

新增

```bash
export SPARK_HOME=/usr/local/spark
export PATH=$SPARK_HOME/bin:$PATH
```

`source ~/.profile`

#### 分发 spark 和 profile

```bash
./run.sh slaves scp $SPARK_HOME ~
./run.sh slaves scp ~/.profile ~/.profile
./run.sh slaves ssh "sudo mv ~/spark /usr/local/spark"
```

![](https://img.makis-life.cn/images/20251210053415942.png?x-oss-process=style/yasuo)
![](https://img.makis-life.cn/images/20251210053415943.png?x-oss-process=style/yasuo)

#### 启动 spark

```bash
spark-shell
```

可以看见欢迎界面
![](https://img.makis-life.cn/images/20251210053415944.png?x-oss-process=style/yasuo)

#### 简单测试 Spark

运行一项简单的测试

```spark
// 读取文件为RDD
val textFile = sc.textFile("file:///usr/local/spark/README.md")

// 获取RDD的第一行内容
textFile.first()
// res0: String = "第一行内容"

// 获取RDD所有项的计数
textFile.count()
// res1: Long = 文件总行数

// 抽取含有 "Spark" 的行，返回一个新的RDD
val lineWithSpark = textFile.filter(line => line.contains("Spark"))

// 统计新的RDD的行数
lineWithSpark.count()
// res2: Long = 含 "Spark" 的行数

// 找出文本中每行的最多单词数
textFile.map(line => line.split(" ").length).reduce((a, b) => if (a > b) a else b)
// res3: Int = 每行的最大单词数

// 退出 spark-shell
:quit
```

![](https://img.makis-life.cn/images/20251210053415945.png?x-oss-process=style/yasuo)

> [!note] 🎉
> 至此，Spark 安装完成！

**至此，完全分布式搭建完成! 🎉**

## 问题与解决

#### 通信

集群起始阶段，小组成员户 ping 出现问题，通过更换网络环境，检查 openssh-server 安装情况，排查后发现是 ufw 防火墙屏蔽了 22 入口。
通过

```bash
sudo ufw allow 22/tcp
```

可解决。

### jdk 版本问题

起初按课程要求采用 1.8u202，但在运行 HBase 时发现要求 jdk11 以上，后使用 jdk11。安装 Hive 时发现 hive 运行需要 jdk21，后安装 jdk21。
更换 jdk 版本时应记得同时更改 profile，hadoop，yarn，hbase，spark 的 jdk 地址

### 空间不足

起初虚拟机已分配存储为 12GB，搭建途中发现无法传入安装包，通过`df -h`发现可用空间剩余不到 300MB。
但是创建虚拟机时分配的硬盘为 25GB，排查后发现有 12GB 为未分配存储。
执行：

```bash
sudo lvresize -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
sudo resize2fs /dev/ubuntu-vg/ubuntu-lv
```

把为分配存储分配好。并且再次检查 hadoop web,各虚拟机的存储也都扩容了。

## 实验总结

此次实验完成了基于四台 Ubuntu 虚拟机的分布式大数据环境搭建，包含 ZooKeeper、Hadoop（HDFS + YARN）、HBase、Hive、Spark、Scala 与 OpenJDK 的安装与联调。掌握了从单机部署到多节点集群分发、配置、启动与验证的完整流程，能够独立复现实验环境并运行基本功能测试用例。

### 主要收获与能力提升

1. 环境部署与自动化分发：熟练使用`/etc/hosts`（hosts 文件）配置主机名解析、编写并使用 run.sh 脚本实现对多节点的`ssh`（SSH）远程执行与`scp`（SCP）分发，提升部署效率。
2. 免密与权限管理：完成 SSH 免密登录（SSH passwordless login）与 sudo 无密码配置（sudoers），简化集群管理流程。
3. 软件安装与环境变量管理：掌握 OpenJDK、Scala、Hadoop、Spark、HBase、Hive 的安装、解压、移动与`~/.profile`（profile）环境变量配置，并将配置同步至所有节点。
4. 组件配置与联调：能够配置 ZooKeeper 集群（myid 与 server.X）、Hadoop 的 core-site/hdfs-site/mapred-site/yarn-site、HBase 的 hbase-site、Hive 的 hive-site（含 JDBC 元数据库）以及 Spark 的 spark-env 与 workers（workers）。
5. 调试与问题解决能力：解决端口/防火墙（ufw）问题、JDK 版本不一致导致的兼容性问题、依赖包冲突（如 guava/slf4j）、磁盘扩容（LVM resize）等常见故障。
6. 集群验证与使用：会使用`hadoop namenode -format`、`start-dfs.sh`、`start-yarn.sh`、`start-hbase.sh`、`zkServer.sh start`等命令启动服务，并通过 Web UI（NameNode/HBase Master/Spark）与`jps`、HBase Shell、Hive(Beeline) 等工具验证集群健康与功能。
7. 大数据工具理解：明确各组件职责与适用场景，能够针对数据存储、实时读写与批处理等需求选择合适工具。
