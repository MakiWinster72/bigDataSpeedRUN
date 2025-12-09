# installJava

## 下载 jdk21

```bash
wget https://mirrors.huaweicloud.com/openjdk/21/openjdk-21_linux-x64_bin.tar.gz
```

## 解压

```bash
tar -xvzf jdk(tab)
```

## 安装 java

```bash
sudo mkdir -p /usr/lib/jvm

sudo mv jdk(tab) /usr/lib/jvm/jdk21
```

## 写入环境变量

```bash
vim ~/.profile
```

### 添加 JAVA_HOME

```profile
export JAVA_HOME=/usr/lib/jvm/jdk21
export PATH=$JAVA_HOME/bin:$PATH
```
