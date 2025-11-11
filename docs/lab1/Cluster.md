> [!tip] 🎉
> 已有sh脚本可一键安装完成 -> [shell](../other/shell.md#hadoop完全分布式)


本文是Hadoop完全分布式安装教程
## 环境说明

- **系统**: Ubuntu 24.04  
- **服务器配置**: 3 台主机  
- **Hadoop 版本**: 3.4.2  
- **集群架构**: 1 个 Master 节点 + 2 个 Slave 节点  
- **节点配置**:  
  - hadoop01 (Master): 名称节点 + 资源管理器  
  - hadoop02 (Slave): 数据节点 + 节点管理器  
  - hadoop03 (Slave): 数据节点 + 节点管理器  

---

## 第一阶段：所有节点基础配置

### 创建 hadoop 用户 (在所有 3 台服务器执行)

① **创建 hadoop 用户并添加 sudo 权限**

```bash
sudo adduser hadoop
sudo usermod -aG sudo hadoop
````

① **切换到 hadoop 用户**

```bash
su hadoop
```

---

### 安装基础软件 (在所有 3 台服务器执行)

**更新系统**

```bash
sudo apt update
sudo apt upgrade -y
```

**安装 Java 环境**

```bash
sudo apt install openjdk-8-jdk -y
```

**配置 JAVA_HOME 环境变量**

```bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64' >> ~/.bashrc
source ~/.bashrc
```

---

### 下载并安装 Hadoop (在 Master 执行即可)

① **下载 Hadoop 3.4.2**

```bash
cd ~
wget https://mirrors.aliyun.com/apache/hadoop/common/hadoop-3.4.2/hadoop-3.4.2.tar.gz
```

> 阿里云服务器可以使用以下内网传输
> wget [http://mirrors.cloud.aliyuncs.com/apache/hadoop/common/hadoop-3.4.2/hadoop-3.4.2.tar.gz](http://mirrors.cloud.aliyuncs.com/apache/hadoop/common/hadoop-3.4.2/hadoop-3.4.2.tar.gz)

![](https://img.makis-life.cn/images/20251110181548090.png)

① **解压并安装**

```bash
sudo tar -zxf hadoop-3.4.2.tar.gz -C /usr/local/
sudo mv /usr/local/hadoop-3.4.2 /usr/local/hadoop
sudo chown -R hadoop:hadoop /usr/local/hadoop
```
![](https://img.makis-life.cn/images/20251110181548091.png)

① **配置 Hadoop 环境变量**

```bash
vim ~/.bashrc
```

在文件末尾添加：

```bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export HADOOP_HOME=/usr/local/hadoop
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
```

① **使配置生效**

```bash
source ~/.bashrc
```

---

## 第二阶段：网络配置

### 设置主机名 (分别在对应服务器执行)

**在第一台服务器 (Master) 执行：**

```bash
sudo hostnamectl set-hostname hadoop01
```

**在第二台服务器 (Slave1) 执行：**

```bash
sudo hostnamectl set-hostname hadoop02
```

**在第三台服务器 (Slave2) 执行：**

```bash
sudo hostnamectl set-hostname hadoop03
```

---

### 配置主机名映射

**在所有 3 台服务器上修改 hosts 文件：**

```bash
sudo vim /etc/hosts
```

添加以下内容：

> 使用 ip addr show 获取 ip 地址

```
ip   hadoop01
ip   hadoop02
ip   hadoop03
```

> 💡 **提示**: 如果云服务器只有公网 IP，可以直接使用公网 IP 地址进行映射，但建议使用内网 IP 以减少网络延迟和流量费用。
> 云服务器需位于同一地域和专用网络内。

---

### 测试网络连通性

在每个节点上测试：

```bash
ping hadoop01 -c 3
ping hadoop02 -c 3
ping hadoop03 -c 3
```


> 确保三台主机互 ping 成功

---

## 第三阶段：SSH 无密码登录配置

### 在 Master 节点 (hadoop01) 操作

① **生成 SSH 密钥**

```bash
cd ~/.ssh || mkdir ~/.ssh && cd ~/.ssh
ssh-keygen -t rsa -P "" -f ~/.ssh/id_rsa
```

① **配置本机无密码登录**

```bash
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

① **将公钥复制到 Slave 节点**

```bash
ssh-copy-id hadoop@hadoop02
ssh-copy-id hadoop@hadoop03
```

### 测试 SSH 无密码登录

```bash
ssh hadoop02
ssh hadoop03
```

---

## 第四阶段：云服务器安全组配置

如果使用阿里云、腾讯云等云服务器，需要在云控制台安全组中开放以下端口：

| 服务               | 默认端口         |
| ---------------- | ------------ |
| NameNode RPC     | 9000         |
| NameNode WebUI   | 9870         |
| DataNode Data    | 9866         |
| DataNode WebUI   | 9864         |
| Secondary NN     | 9868         |
| ResourceManager  | 8032, 8088   |
| NodeManager      | 8042         |
| JobHistoryServer | 10020, 19888 |

---

## 第五阶段：Hadoop 集群配置

### 配置 Hadoop 环境变量

```bash
vim /usr/local/hadoop/etc/hadoop/hadoop-env.sh
```

添加或修改：

```bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
```

---

### 配置集群文件 (仅在 hadoop01 执行)

① **workers 文件**

```bash
vim /usr/local/hadoop/etc/hadoop/workers
```

内容：

```
hadoop02
hadoop03
```

---

### 同步配置到所有节点

在 hadoop01 上执行：

```bash
cd /usr/local
sudo tar -zcf ~/hadoop.master.tar.gz ./hadoop

# 传输到 slave 节点
scp ~/hadoop.master.tar.gz hadoop02:/home/hadoop/
scp ~/hadoop.master.tar.gz hadoop03:/home/hadoop/
```

在 hadoop02 和 hadoop03 上执行：

```bash
cd ~
sudo rm -rf /usr/local/hadoop
sudo tar -zxf ~/hadoop.master.tar.gz -C /usr/local/
sudo chown -R hadoop:hadoop /usr/local/hadoop
```

## 配置文件

- **core-site.xml**
    

```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://hadoop01:9000</value>
    </property>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>file:/usr/local/hadoop/tmp</value>
    </property>
</configuration>

```

- **yarn-site.xml**
    

```xml
<configuration>
    <property>
        <name>yarn.resourcemanager.hostname</name>
        <value>hadoop01</value>
    </property>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.env-whitelist</name>
        <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PREPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_MAPRED_HOME</value>
    </property>
    <property>
        <name>yarn.resourcemanager.webapp.address</name>
        <value>hadoop01:8088</value>
    </property>
</configuration>
```

- **hdfs-site.xml**
    

```xml
<configuration>
    <property>
        <name>dfs.namenode.secondary.http-address</name>
        <value>hadoop01:50090</value>
    </property>
    <property>
        <name>dfs.replication</name>
        <value>2</value>
    </property>
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:/usr/local/hadoop/tmp/dfs/name</value>
    </property>
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:/usr/local/hadoop/tmp/dfs/data</value>
    </property>
    <property>
        <name>dfs.namenode.http-address</name>
        <value>hadoop01:9870</value>
    </property>
</configuration>
```

- **mapred-site.xml**
    

```xml
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
    <property>
        <name>mapreduce.jobhistory.address</name>
        <value>hadoop01:10020</value>
    </property>
    <property>
        <name>mapreduce.jobhistory.webapp.address</name>
        <value>hadoop01:19888</value>
    </property>
    <property>
        <name>yarn.app.mapreduce.am.env</name>
        <value>HADOOP_MAPRED_HOME=/usr/local/hadoop</value>
    </property>
    <property>
        <name>mapreduce.map.env</name>
        <value>HADOOP_MAPRED_HOME=/usr/local/hadoop</value>
    </property>
    <property>
        <name>mapreduce.reduce.env</name>
        <value>HADOOP_MAPRED_HOME=/usr/local/hadoop</value>
    </property>
</configuration>
```

## 第六阶段：启动集群

### 格式化 NameNode (仅第一次，在 hadoop01 执行)

```bash
hdfs namenode -format
```

### 启动集群服务 (在 hadoop01 执行)

```bash
start-dfs.sh
start-yarn.sh
mapred --daemon start historyserver
```

### 验证集群状态

①**检查进程**

```bash
# 在hadoop01上执行
jps

## NameNode, SecondaryNameNode, ResourceManager, JobHistoryServer

# 在hadoop02和hadoop03上执行
jps
## DataNode, NodeManager

# 以上少一个都是报错
```

①**检查 HDFS 状态**

```bash
hdfs dfsadmin -report
```

输出（只要LiveNode不等于0就是成功了）

```
Configured Capacity: 83765886976 (78.01 GB)
Present Capacity: 61911212032 (57.66 GB)
DFS Remaining: 61911162880 (57.66 GB)
DFS Used: 49152 (48 KB)
DFS Used%: 0.00%
Replicated Blocks:
        Under replicated blocks: 0
        Blocks with corrupt replicas: 0
        Missing blocks: 0
        Missing blocks (with replication factor 1): 0
        Low redundancy blocks with highest priority to recover: 0
        Pending deletion blocks: 0
Erasure Coded Block Groups:
        Low redundancy block groups: 0
        Block groups with corrupt internal blocks: 0
        Missing block groups: 0
        Low redundancy blocks with highest priority to recover: 0
        Pending deletion blocks: 0

-------------------------------------------------
Live datanodes (2):

Name: 120.2xx.1x.1xx:9866 (hadoop02)
Hostname: hadoop02
Decommission Status : Normal
Configured Capacity: 41882943488 (39.01 GB)
DFS Used: 24576 (24 KB)
Non DFS Used: 11279278080 (10.50 GB)
DFS Remaining: 28667904000 (26.70 GB)
DFS Used%: 0.00%
DFS Remaining%: 68.45%
Configured Cache Capacity: 0 (0 B)
Cache Used: 0 (0 B)
Cache Remaining: 0 (0 B)
Cache Used%: 100.00%
Cache Remaining%: 0.00%
Xceivers: 0
Last contact: Sun Sep 21 03:07:57 CST 2025
Last Block Report: Sun Sep 21 03:00:42 CST 2025
Num of Blocks: 0


Name: 47.11x.xx8.xxx:9866 (hadoop03)
Hostname: hadoop03
Decommission Status : Normal
Configured Capacity: 41882943488 (39.01 GB)
DFS Used: 24576 (24 KB)
Non DFS Used: 6703923200 (6.24 GB)
DFS Remaining: 33243258880 (30.96 GB)
DFS Used%: 0.00%
DFS Remaining%: 79.37%
Configured Cache Capacity: 0 (0 B)
Cache Used: 0 (0 B)
Cache Remaining: 0 (0 B)
Cache Used%: 100.00%
Cache Remaining%: 0.00%
Xceivers: 0
Last contact: Sun Sep 21 03:07:55 CST 2025
Last Block Report: Sun Sep 21 03:00:37 CST 2025
Num of Blocks: 0
```

①**Web 界面访问**

- NameNode: `http://IP:9870`
- ResourceManager: `http://IP:8088`
- JobHistory: `http://IP:19888`

## 第七阶段：测试 MapReduce

### 创建测试目录和文件

```bash
hdfs dfs -mkdir /user
hdfs dfs -mkdir /user/hadoop
hdfs dfs -mkdir input
hdfs dfs -put $HADOOP_HOME/etc/hadoop/*.xml input
```

### 运行词频统计示例

```bash
hadoop jar $HADOOP_HOME/share/hadoop/mapreduce/hadoop-mapreduce-examples-3.4.2.jar wordcount input output
```
![](https://img.makis-life.cn/images/20251110181548092.png)

### 查看结果

scat output/part-r-00000

## 关闭集群

在 hadoop01 执行：

```bash
mapred --daemon stop historyserver
stop-yarn.sh
stop-dfs.sh
```
