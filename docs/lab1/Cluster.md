> [!tip] 🎉
> 已有sh脚本可一键安装完成 -> [shell](../other/shell.md#hadoop完全分布式)

# Hadoop 完全分布式集群安装指南

## 环境准备

### 允许 hadoop 免密码 sudo

> 这一步允许 sudo 命令无须密码，方便后续执行

在 master 和 slave1 ～ n 都执行

```bash
sudo visudo
```

会用 nano 编辑 sudoers
新增一行

```
hadoop ALL=(ALL) NOPASSWD: ALL
```

![](https://img.makis-life.cn/images/20251210022335976.png?x-oss-process=style/yasuo)

### 通信

四台主机全部接入同一路由器，即均处于同一局域网中，从而实现主机间通信。

令虚拟机处于桥接模式，在 Ubuntu 中使用 `ip addr show` 查看 ip 地址

例如：

![](https://img.makis-life.cn/images/20251210022335977.png?x-oss-process=style/yasuo)

<center>检查 Master 的 IP 地址</center>

其中 enp0s3 是当前所使用的网卡，可知目前 ipv4 地址为 192.168.1.101。

获取到四台虚拟机的 IP 地址如下

| 主机   | IPv4          |
| ------ | ------------- |
| Master | 192.168.1.104 |
| Slave1 | 192.168.1.102 |
| Slave2 | 192.168.1.101 |
| Slave3 | 192.168.1.105 |

#### 检查连通性

虚拟机间互 ping，检验不同主机间虚拟机是否可以正常通信

1. 登录 master

```bash
ssh hadoop@192.168.1.104
ping 192.168.1.102 -c 3
ping 192.168.1.101 -c 3
ping 192.168.1.105 -c 3
```

![](https://img.makis-life.cn/images/20251210022335978.png?x-oss-process=style/yasuo)

### 编辑 hosts 文件

```bash
sudo vim /etc/hosts
```

添加以下内容：

```
192.168.1.104 master
192.168.1.102 slave1
192.168.1.101 slave2
192.168.1.105 slave3
```

![](https://img.makis-life.cn/images/20251210022335979.png?x-oss-process=style/yasuo)

将 hosts 文件传递给各主机

```bash
scp /etc/hosts hadoop@slave1:~
scp /etc/hosts hadoop@slave2:~
scp /etc/hosts hadoop@slave3:~
```

在各 slave 节点执行：

```bash
sudo mv ~/hosts /etc/hosts
```

![](https://img.makis-life.cn/images/20251210022335980.png?x-oss-process=style/yasuo)

### 设置主机名

在 master 执行：

```bash
sudo hostnamectl set-hostname master
```

![](https://img.makis-life.cn/images/20251210022335981.png?x-oss-process=style/yasuo)

<center>Master 设置主机名</center>

可见，再次输入`bash`(或重新打开一个新的终端)，即刷新当前 SHELL，可以看见前面已经变为 hadoop@master，方便辨认 master 和 slaves

在各 slave 节点分别执行：

```bash
# 在 slave1 上
sudo hostnamectl set-hostname slave1

# 在 slave2 上
sudo hostnamectl set-hostname slave2

# 在 slave3 上
sudo hostnamectl set-hostname slave3
```

![](https://img.makis-life.cn/images/20251210022335982.png?x-oss-process=style/yasuo)

### 配置 ssh 免密码登录

hadoop 集群需要 ssh 免密码登录才可正常运行

> 并且上述可见，即使已经配置了 hadoop 免密 sudo 权限，但是远程登录依然需要密码，Slaves 多了非常麻烦。配置 ssh 免密码登录可减少输入密码的步骤。

#### 在 master 节点执行

```bash
# 生成密钥对
ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
```

![](https://img.makis-life.cn/images/20251210022335983.png?x-oss-process=style/yasuo)

#### 分发密钥

```bash
# 复制公钥到所有节点（包括自己）
ssh-copy-id -i ~/.ssh/id_rsa.pub master
ssh-copy-id -i ~/.ssh/id_rsa.pub slave1
ssh-copy-id -i ~/.ssh/id_rsa.pub slave2
ssh-copy-id -i ~/.ssh/id_rsa.pub slave3
```

会依次询问是否添加主机以及对应主机的密码，全部yes即可。

![](https://img.makis-life.cn/images/20251210022335984.png?x-oss-process=style/yasuo)

#### 测试免密登录

```bash
ssh master
ssh slave1
ssh slave2
ssh slave3
```

可见现在 ssh slave1 已经不再需要输入密码，免登录设置成功。

![](https://img.makis-life.cn/images/20251210022335985.png?x-oss-process=style/yasuo)

## 安装 Java

### 下载

前往[华为 Openjdk](https://mirrors.huaweicloud.com/openjdk/) 或 [资源页](../resources.md#JAVA) 下载

```bash
wget https://mirrors.huaweicloud.com/openjdk/21/openjdk-21_linux-x64_bin.tar.gz
```

> 当然也可以 sudo apt install openjdk-21-jdk, 此时安装路径为/usr/lib/jvm/java-21-openjdk

### 安装

```bash
tar -xzf openjdk-21_linux-x64_bin.tar.gz  # 解压缩
sudo mkdir -p /usr/lib/jvm                # 创建目录
sudo mv jdk-21 /usr/lib/jvm/jdk21         # 把jdk-21移动到jvm并重命名为jdk21
```

编辑`~/.profile`文件，写入 JAVA_HOME

```bash
vim ~/.profile
```

添加以下内容：

```bash
# JAVA
export JAVA_HOME=/usr/lib/jvm/jdk21
export PATH=$JAVA_HOME/bin:$PATH
```

![](https://img.makis-life.cn/images/20251210022335986.png?x-oss-process=style/yasuo)

应用环境变量：

```bash
source ~/.profile
```

检验 java 是否安装成功

```bash
java -version
```

![](https://img.makis-life.cn/images/20251210022335987.png?x-oss-process=style/yasuo)

### 分发 java 并安装

将 jdk 分发到各 slave 节点：

```bash
scp -r /usr/lib/jvm/jdk21 hadoop@slave1:~
scp -r /usr/lib/jvm/jdk21 hadoop@slave2:~
scp -r /usr/lib/jvm/jdk21 hadoop@slave3:~
```

在各 slave 节点执行：

```bash
sudo mkdir -p /usr/lib/jvm
sudo mv ~/jdk21 /usr/lib/jvm/jdk21
```

分发 .profile 文件：

```bash
scp ~/.profile hadoop@slave1:~
scp ~/.profile hadoop@slave2:~
scp ~/.profile hadoop@slave3:~
```

在各 slave 节点执行：

```bash
source ~/.profile
```

检查各个主机是否成功安装 java：

```bash
# 在各节点执行
java -version
```

![](https://img.makis-life.cn/images/20251210022335988.png?x-oss-process=style/yasuo)

## 安装 Hadoop 集群

### 下载 Hadoop

前往 [资源页](../resources.md#大数据组件) 或使用 wget：

```bash
wget https://mirrors.aliyun.com/apache/hadoop/common/hadoop-3.4.2/hadoop-3.4.2.tar.gz
```

### 在 master 上安装 hadoop

将 hadoop 安装包上传到 master 节点后执行：

```bash
tar -xzf hadoop-3.4.2.tar.gz                   # 解压缩
sudo mv hadoop-3.4.2 /usr/local/hadoop         # 移动hadoop-3.4.2到hadoop文件夹并重命名
sudo chown -R hadoop:hadoop /usr/local/hadoop  # 更改文件所属权
```

![](https://img.makis-life.cn/images/20251210022335989.png?x-oss-process=style/yasuo)

### 创建工作环境

```bash
sudo mkdir -p /usr/local/hadoop/tmp
sudo mkdir -p /usr/local/hadoop/hdfs/name
sudo mkdir -p /usr/local/hadoop/hdfs/data
sudo chown -R hadoop:hadoop /usr/local/hadoop
```

### 配置 Hadoop 环境变量

编辑`~/.profile`，新增：

```bash
vim ~/.profile
```

添加以下内容：

```bash
# HADOOP
export HADOOP_HOME=/usr/local/hadoop
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export HADOOP_YARN_HOME=$HADOOP_HOME
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
export CLASSPATH=$CLASSPATH:$HADOOP_HOME/lib
export PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin
```

目前 `~/.profile` 状态：

![](https://img.makis-life.cn/images/20251210022335990.png?x-oss-process=style/yasuo)

应用环境变量：

```bash
source ~/.profile
```

### 配置 Hadoop 各组件

进入 Hadoop 配置目录：

```bash
cd $HADOOP_HOME/etc/hadoop
```

#### 配置 hadoop-env.sh

```bash
vim hadoop-env.sh
```

找到`export JAVA_HOME=`行，修改或添加：

```bash
export JAVA_HOME=/usr/lib/jvm/jdk21
```

![](https://img.makis-life.cn/images/20251210022335991.png?x-oss-process=style/yasuo)

#### 配置 yarn-env.sh

```bash
vim yarn-env.sh
```

同样添加 JAVA_HOME：

```bash
export JAVA_HOME=/usr/lib/jvm/jdk21
```

#### 配置 core-site.xml

```bash
vim core-site.xml
```

在 `<configuration>` 标签内添加：

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
    <property>
        <name>hadoop.proxyuser.hadoop.hosts</name>
        <value>*</value>
    </property>
    <property>
        <name>hadoop.proxyuser.hadoop.groups</name>
        <value>*</value>
    </property>
</configuration>
```

#### 配置 hdfs-site.xml

```bash
vim hdfs-site.xml
```

在 `<configuration>` 标签内添加：

```xml
<configuration>
    <property>
    <!-- 这里配置了冗余存储多少份，根据slaves数量决定 -->
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

```bash
vim yarn-site.xml
```

在 `<configuration>` 标签内添加：

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

```bash
vim mapred-site.xml
```

在 `<configuration>` 标签内添加：

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

#### 配置 workers 文件

```bash
vim $HADOOP_HOME/etc/hadoop/workers
```

删除默认的 localhost，添加所有 slave 节点：

```
slave1
slave2
slave3
```

### 分发 Hadoop 到 Slave 节点

#### 分发 profile 文件

```bash
scp ~/.profile hadoop@slave1:~
scp ~/.profile hadoop@slave2:~
scp ~/.profile hadoop@slave3:~
```

在各 slave 节点执行：

```bash
source ~/.profile
```

检查是否分发成功：

```bash
echo $HADOOP_HOME
```

![](https://img.makis-life.cn/images/20251210022335992.pn?x-oss-process=style/yasuog)

#### 分发 hadoop 目录

```bash
scp -r /usr/local/hadoop hadoop@slave1:~
scp -r /usr/local/hadoop hadoop@slave2:~
scp -r /usr/local/hadoop hadoop@slave3:~
```

![](https://img.makis-life.cn/images/20251210022335994.png?x-oss-process=style/yasuo)

在各 slave 节点执行：

```bash
sudo mv ~/hadoop /usr/local/hadoop
sudo chown -R hadoop:hadoop /usr/local/hadoop
```

### 格式化 NameNode

在 master 节点执行：

```bash
hadoop namenode -format
```

![](https://img.makis-life.cn/images/20251210022335995.png?x-oss-process=style/yasuo)

看到 "Storage directory /usr/local/hadoop/hdfs/name has been successfully formatted" 表示格式化成功。

![](https://img.makis-life.cn/images/20251210022335996.png?x-oss-process=style/yasuo)

### 启动 Hadoop 集群

在 master 节点执行：

```bash
start-dfs.sh
start-yarn.sh
```

![](https://img.makis-life.cn/images/20251210022335997.png?x-oss-process=style/yasuo)

### 检查各节点进程

#### Master 节点

```bash
jps
```

应该看到以下进程：

- NameNode
- SecondaryNameNode
- ResourceManager

![](https://img.makis-life.cn/images/20251210022335998.png?x-oss-process=style/yasuo)

#### Slave 节点

在各 slave 节点执行：

```bash
jps
```

应该看到以下进程：

- DataNode
- NodeManager

![](https://img.makis-life.cn/images/20251210022335999.png?x-oss-process=style/yasuo)

### 访问 Hadoop Web UI

在浏览器访问：

- HDFS Web UI: `http://master:9870`
- YARN Web UI: `http://master:8088`

![](https://img.makis-life.cn/images/20251210022336000.png?x-oss-process=style/yasuo)

可以看见所有 DataNode 的信息，表示 Hadoop 集群搭建成功！

## 启动/停止集群

```bash
# 启动 HDFS
start-dfs.sh

# 启动 YARN
start-yarn.sh

# 停止 HDFS
stop-dfs.sh

# 停止 YARN
stop-yarn.sh
```

### HDFS 常用命令

```bash
# 查看 HDFS 目录
hdfs dfs -ls /

# 创建目录
hdfs dfs -mkdir /test

# 上传文件
hdfs dfs -put localfile.txt /test/

# 下载文件
hdfs dfs -get /test/file.txt .

# 删除文件
hdfs dfs -rm /test/file.txt

# 删除目录
hdfs dfs -rm -r /test

# 查看文件内容
hdfs dfs -cat /test/file.txt

# 查看 HDFS 报告
hdfs dfsadmin -report
```

### YARN 常用命令

```bash
# 查看所有应用
yarn application -list

# 查看节点状态
yarn node -list

# 终止应用
yarn application -kill <application_id>
```
