# installJava
## 下载jdk11
```bash
wget https://mirrors.huaweicloud.com/java/jdk/11+28/jdk-11_linux-x64_bin.tar.gz
```

## 解压
```bash
tar -xvzf jdk(tab)
```

## 安装java
```bash
sudo mkdir -p /usr/lib/jvm

sudo mv jdk(tab) /usr/lib/jvm/jdk11
```

## 写入环境变量
```bash
vim ~/.profile
```

### 添加JAVA_HOME
```profile
export JAVA_HOME=/usr/lib/jvm/jdk11
export PATH=$JAVA_HOME/bin:$PATH
```
