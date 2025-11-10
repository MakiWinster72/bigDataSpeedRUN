> [!tip] 🎉
> 已有sh脚本可一键安装完成 -> [shell](../other/shell.md#hadoop伪分布式)

## 创建 Hadoop 用户

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

---

## 配置 SSH 无密码登录

① 安装 SSH 服务

```bash
sudo apt install openssh-server
```

② 登录测试

```bash
ssh localhost
```

③ 生成密钥并配置免密登录

```bash
exit
cd ~/.ssh/
ssh-keygen -t rsa
cat ./id_rsa.pub >> ./authorized_keys
```

完成后再次执行 `ssh localhost`，第一次输入 `yes`，之后登录不再需要密码。

---

## 安装 Java

① 安装 OpenJDK 8

```bash
sudo apt update
sudo apt install openjdk-8-jdk
```

② 设置环境变量

编辑 `~/.bashrc` 或 `~/.zshrc`

```bash
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin
```

使配置生效

```bash
source ~/.bashrc
```

③ 验证

```bash
java -version
```

---

## 安装 Hadoop

① 下载 Hadoop

```bash
wget https://mirrors.aliyun.com/apache/hadoop/common/hadoop-3.4.2/hadoop-3.4.2.tar.gz
```

② 解压到 `/usr/local/`

```bash
sudo tar -zxf hadoop-3.4.2.tar.gz -C /usr/local/
cd /usr/local
sudo mv ./hadoop-3.4.2 ./hadoop
```

③ 设置环境变量

编辑 `~/.bashrc` 或 `~/.zshrc`

```bash
export HADOOP_HOME=/usr/local/hadoop
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
```

使配置生效

```bash
source ~/.bashrc
```

④ 验证 Hadoop 是否安装成功

```bash
hadoop version
```

---

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

---

## 配置 JAVA_HOME

编辑 `/usr/local/hadoop/etc/hadoop/hadoop-env.sh`

找到：
`# export JAVA_HOME=`

改成：
`export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64`
