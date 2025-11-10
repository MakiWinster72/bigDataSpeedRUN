> [!attention]
> 本文章说明主机向虚拟机共享文件的方法，三种方法均通过应用层实现依赖于网络层，虚拟机需要以**桥接模式**上网。

## 主机向虚拟机共享文件教程

---

## Python HTTP Server


① **Windows 启动文件服务器**

- 打开命令提示符（_CMD_）
![](assets/2025-11-10-13.png)
- 进入要共享的文件夹：
    ```bash
    cd D:\share
    ```
    
- 启动 Python HTTP 服务：
    
    ```bash
    python -m http.server 8080
    ```
![](assets/2025-11-10-15.png)
> 如上为未安装python,请进入[python.org](python.org)安装python

② **查看主机 IP 地址**

- 在 Windows 中执行：
    
    ```bash
    ipconfig
    ```
    
    找到当前网络适配器下的 **IPv4 地址**，例如：
    
    ```
    IPv4 地址 . . . . . . . . . . . . : 192.168.1.10
    ```
![](assets/2025-11-10-16.png)
> [!note]
> 图中为20.20.20.21，常见192或172开头。

③ **在虚拟机下载文件**

- 打开浏览器 `Firefox`，在地址栏输入 
	```bash
http://WindowsIPv4:8000
	```
	即可进入文件服务器页面，点击文件即可下载。

>Server无图形界面可采用如下方法
>sudo apt install -y wget curl

- 使用 `wget` 或 `curl` 下载文件：
    
    ```bash
    wget http://192.168.1.10:8080/filename.zip
    ```
    
    或者：
    
    ```bash
    curl -O http://192.168.1.10:8080/filename.zip
    ```
    

---

## SCP 与 RSYNC 传输

① **获取 IP 地址**

- Windows：
    
    ```bash
    ipconfig
    ```
    
- Ubuntu：
    
    ```bash
    ip addr show
    ```
    

② **Windows → Ubuntu 传文件**

Windows 使用 **PowerShell** 或 **CMD**（已安装 `scp` 或 `rsync` 的前提下）：

- **使用 SCP**：
    
    ```bash
    scp D:\share\file.zip 用户名@192.168.1.20:/home/用户名/
    ```
    
- **使用 RSYNC**（适合大文件或同步目录）：
    
    ```bash
    rsync -avz D:\share\ 用户名@192.168.1.20:/home/用户名/share/
    ```
    
---

## 总结

- 临时传文件：`python -m http.server` 最方便
    
- 稳定传文件：`scp`
    
- 同步目录或大文件：`rsync`