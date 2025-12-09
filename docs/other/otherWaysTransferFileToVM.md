本文章是除共享文件夹外，主机与虚拟机沟通传输文件的方法。

## Python HTTP Server

> 此方法<u>比较</u>适用于 Ubuntu Desktop，或者 server 安装了桌面环境，例如 xfce,gnome 等

#### Windows 启动 Python http 服务器

按下`Windows`键，输入 cmd，按下`Enter`
![](https://img.makis-life.cn/images/20251110181534127.png)

复制要共享的文件夹的路径，在 cmd 中输入`cd 路径`，回车
![](https://img.makis-life.cn/images/20251110181534128.png)

> 注意路径是否有空格，比如有人的用户名有空格，或者最后文件夹是 shared folder 等，路径需要用**双引号**括起来。

转入到目标文件夹后，输入

```bash
python -m http.server -p 8000  #可以手动指定端口
```

出现下图情况就是 Python 未安装，或者环境变量没配置好，请自行搜索安装 Python 的方法。
![](https://img.makis-life.cn/images/20251110181534129.png)

#### 获取 windows IP 地址

在 cmd 中输入`ipconfig`即可查看 ipv4 地址。
![](https://img.makis-life.cn/images/20251110181534130.png)
记住图中 ipv4 地址，常见 192 或 172 开头。

在虚拟机中，打开浏览器，一般默认安装了 Firefox。
在地址栏里面输入:

```
http://WindowIP地址:8000
```

即可看见主机共享的文件夹了。

#### Server 无图形界面可采用如下方法

> sudo apt install -y wget curl

- 使用 `wget` 或 `curl` 下载文件：
  ```bash
  wget http://192.168.1.10:8080/filename.zip
  ```
  或者：
  ```bash
  curl -O http://192.168.1.10:8080/filename.zip
  ```

## rsync & scp

### ① 获取虚拟机 IP 地址

1. 在 Ubuntu 虚拟机终端执行：

```bash
ip addr show
```

2. 找到 `eth0` 或 `enp0s3`（网卡）下的 `inet` 地址，比如：

```
inet 192.168.56.101/24
```

这里 `192.168.56.101` 就是虚拟机 IP。

---

### ② 使用 SCP 传文件

**SCP（Secure Copy）** 通过 SSH 传输文件，需要虚拟机开启 SSH 服务：

```bash
sudo apt install -y openssh-server
sudo systemctl enable ssh
sudo systemctl start ssh
```

#### 从 Windows 传文件到 Ubuntu

1. 安装 **WinSCP** 或使用 **PowerShell/命令提示符**：

```powershell
scp C:\Users\Maki\Documents\file.txt username@ip地址:/home/username/
```

- `C:\Users\Maki\Documents\file.txt`：Windows 文件路径
- `username`：Ubuntu 用户名
- `/home/username/`：虚拟机目标路径

2. 输入虚拟机密码后，文件即可传输。

#### 从 Ubuntu 拉文件到 Windows

```bash
scp username@1ip地址:/home/username/file.txt C:\Users\Maki\Downloads\
```

---

### ③ 使用 rsync 传文件

**rsync** 更适合传大文件或目录，并支持增量同步。

1. 在 Ubuntu 安装 rsync：

```bash
sudo apt install -y rsync
```

2. Windows 端安装 **Cygwin** 或 **WSL**，确保有 rsync 命令。
3. 从 Windows 传文件到 Ubuntu：

```bash
rsync -avz /mnt/c/Users/Maki/Documents/file.txt username@192.168.56.101:/home/username/
```

- `-a`：归档模式（保留权限等）
- `-v`：显示详细信息
- `-z`：压缩传输

4. 从 Ubuntu 拉文件到 Windows：

```bash
rsync -avz username@192.168.56.101:/home/username/file.txt /mnt/c/Users/Maki/Downloads/
```
