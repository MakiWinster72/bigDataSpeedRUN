> [!tip] 🎉
> 已有sh脚本可一键安装完成 -> [shell](../other/shell.md#hadoop伪分布式)

## 创建 Hadoop 用户

> 如果当前已经是hadoop用户就不需要创建了

① 创建 `hadoop` 用户并加入 sudo 组

```bash
sudo useradd -m hadoop -s /bin/bash
sudo passwd hadoop
sudo adduser hadoop sudo
```

② 切换到 hadoop 用户

```bash
su hadoop
```

## 配置 SSH 无密码登录

① 安装 SSH 服务

```bash
sudo apt install openssh-server
```

② 登录测试

```bash
ssh localhost
```

> localhost 表示连接自己

③ 生成密钥并配置免密登录

```bash
exit                   # 退出刚刚的ssh连接
cd ~/.ssh/
ssh-keygen -t rsa
cat ./id_rsa.pub >> ./authorized_keys
```

完成后再次执行 `ssh localhost`，之后登录不再需要密码。

## 安装 Java

① 安装 OpenJDK 21

```bash
sudo apt update
sudo apt install openjdk-21-jdk
```

② 设置环境变量

编辑 `~/.profile`

```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64  # 一般都安装在这里
export PATH=$PATH:$JAVA_HOME/bin                     # 将jdk添加到系统环境变量

```

> JAVA_HOME的路径可以用`sudo update-alternatives --config java`查看

使配置生效

```bash
source ~/.profile
```

③ 验证

```bash
java -version
```

---

## 安装 Hadoop

① 下载 Hadoop

> 如果下方连接失效了，请前往[资源页](../resources.md#大数据组件)获取

```bash
wget https://mirrors.aliyun.com/apache/hadoop/common/hadoop-3.4.2/hadoop-3.4.2.tar.gz
```

② 解压到 `/usr/local/`

```bash
sudo tar -zxf hadoop-3.4.2.tar.gz -C /usr/local/   # 解压缩到/usr/local
cd /usr/local                                      # 进入工作目录
sudo mv ./hadoop-3.4.2 ./hadoop                    # 改名
```

③ 设置环境变量

编辑 `~/.profile`

```bash
export HADOOP_HOME=/usr/local/hadoop
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
```

使配置生效

```bash
source ~/.profile
```

④ 验证 Hadoop 是否安装成功

```bash
hadoop version
```

## 测试 Hadoop

① 进入工作目录

```bash
cd /usr/local/hadoop
```

② 创建输入目录

```bash
mkdir input
```

③ 将配置文件复制到输入目录

```bash
cp ./etc/hadoop/*xml ./input
```

④ 运行 Grep 示例

```bash
./bin/hadoop jar /usr/local/hadoop/share/hadoop/mapreduce/hadoop-mapreduce-examples-3.4.2.jar grep ./input ./output 'dfs[a-z.]+'
```

⑤ 查看结果

```bash
cat ./output/*
```

## 配置 JAVA_HOME

编辑 `/usr/local/hadoop/etc/hadoop/hadoop-env.sh`

```bash
vim /usr/local/hadoop/etc/hadoop/hadoop-env.sh

# 或(环境变量的用处，会自动把$HADOOP_HOME解析为/usr/local/hadoop)
Vim $HADOOP_HOME/etc/hadoop/hadoop-env.sh
```

找到：
`# export JAVA_HOME=`

> vim可以使用`/`进入搜索模式，搜索JAVA_HOME，然后持续按n表示下一个，N表示上一个

改成：
`export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64`
