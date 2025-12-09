# 本教程使用Ubuntu24.04.03 LTS

iso文件请前往resources页面下载: [resources](../resources.md)

## VMWare

1. 下载好ISO文件后，点击左上角的`文件`，新建一个虚拟机
![Pasted image 20251209230644](https://img.makis-life.cn//images/20251210071449582.png)
2. 选择典型安装
![Pasted image 20251209230721](https://img.makis-life.cn//images/20251210071449583.png)
3. 点击`浏览`，选中下载好的ISO文件
![Pasted image 20251209230803](https://img.makis-life.cn//images/20251210071449584.png)
4. 填写信息
![Pasted image 20251209230845](https://img.makis-life.cn//images/20251210071449585.png)
5. 一直下一步到这，选择`自定义硬件`
![Pasted image 20251209230920](https://img.makis-life.cn//images/20251210071449586.png)
6. 网络改为桥接模式
![Pasted image 20251209231010](https://img.makis-life.cn//images/20251210071449587.png)
7. 点击关闭，然后完成

> [!info]
>
> 请选择:
> [Install UbuntuDesktop](<#Ubuntu Desktop>)
> [Install UbuntuServer(推荐)](<#Ubuntu Server>)
## VirtualBox

1. 下载好ISO文件后，点击左上角的“新建”
   ![](https://img.makis-life.cn/images/20251110181431330.png)
2. 填入虚拟机名字，例如`ubuntu` ，取消勾选`Proceed with Unattended Installation`
   ![](https://img.makis-life.cn/images/20251110181431331.png)
3. 展开`Specify virtual hardware`,可以更改虚拟机性能
   ![](https://img.makis-life.cn/images/20251110181431332.png)
   建议保留默认设置即可，后续搭建集群要多开，不建议加大内存。
   点击完成。
4. **先别启动虚拟机**，点击设置
   ![](https://img.makis-life.cn/images/20251110181431333.png)
5. 在“网络”>“网卡1”>Attached to,更改为桥接网卡，英文为`Brige`模式。
   ![](https://img.makis-life.cn/images/20251110181431334.png)
   > [!info]
   > 该模式下虚拟机拥有独立的IP,只有这样，主机以及各虚拟机之间才能通过ip地址进行通信。
   > **校园网没有DHCP**,建议使用自己的路由器或手机热点。

点击确定。
启动虚拟机。

如果无法启动，请搜索“电脑型号+进入BIOS”以及“电脑型号+启用虚拟化“

> [!info]
>
> 请选择:
> [Install UbuntuDesktop](<#Ubuntu Desktop>)
> [Install UbuntuServer(推荐)](<#Ubuntu Server>)

## Ubuntu Desktop

<div id="ubuntudesktop"></div>

1. 点击try or install ubuntu
   ![](https://img.makis-life.cn/images/20251110181431335.png)

2. 选英文选英文选英文选英文选英文选英文选英文选英文
   ![](https://img.makis-life.cn/images/20251110181431336.png)

> 强烈建议在使用Linux系统时默认使用英文作为首选语言，中文输入法可通过安装fcitx5或者ibus解决。

3. 一直下一步就可以了

> 如果你是真机安装，那么还是请注意每一步的意义清楚每一步的后果。

4. 设置名字和主机名、密码等
   ![](https://img.makis-life.cn/images/20251110181431337.png)
   > 其实这一步就可以直接叫hadoop了，后续实验基本用不上默认用户。
   > 密码建议非常弱小的密码，因为后续我们将会一遍又一遍地频繁输入，你也不想每次都输入大小写字母数字+特殊符号的密码吧...真机看自己
   > 可选取消勾选`Require my password to log in`，方便。

下一步，选择时区后点击安装即可。

安装完成后会提示`重启/继续试用ubuntu`，重启即可进入全新的ubuntu系统。

### 重启后安装基本软件

```bash
sudo apt update
sudo apt install -y wget curl vim zip unzip tar openssh-server htop lsof git net-tools
```

## Ubuntu Server

1. 选择`Try or install ubuntu`
2. 选英文选英文选英文选英文选英文！！
   ![](https://img.makis-life.cn/images/20251110181431338.png)

> 强烈建议在使用Linux系统时默认使用英文作为首选语言，中文输入法可通过安装fcitx5或者ibus解决。

3. 然后一直`Enter`
4. 通过`Tab`切换选择，安装minimized
   ![](https://img.makis-life.cn/images/20251110181431339.png)
5. 下一步是网络配置，这一步确保之前选择了`桥接`模式，会发现已经自动帮我们配置好了新的IP。
   ![](https://img.makis-life.cn/images/20251110181431340.png)
   > 也可手动分配ip,例如 namenode 是 192.168.1.200/24, dn1 是 201, dn2 是 202
6. 一直下一步，会到选择镜像(mirror)配置，会自动选择镜像站，正常测试到清华源即可
   ![](https://img.makis-life.cn/images/20251110181431341.png)
7. 存储配置也是默认即可
   ![](https://img.makis-life.cn/images/20251110181431342.png)
   > 真机这一步必须谨慎配置，尤其是和Windows共存一块硬盘的情况。

一直下一步，在最后选择`Continue`继续即可。8. 配置用户名、主机名以及密码
![](https://img.makis-life.cn/images/20251110181431343.png)

> 其实这一步就可以直接叫hadoop了，后续实验基本用不上默认用户。
> 密码建议非常弱小的密码，因为后续我们将会<u>一遍又一遍地频繁输入</u>，你也不想每次都输入*大小写字母数字+特殊符号*的密码吧...真机看自己

9. 一直下一步，选择安装openssh-server ![](https://img.makis-life.cn/images/20251110181431344.png)

   > 忘记勾选也没事，后续sudo apt install openssh-server就可以了

10. 这一步是问你是否要预装一些服务器应用，我们用不上，后续需要使用也可以手动安装，这一步选择`Done`就开始安装系统了
    ![](https://img.makis-life.cn/images/20251110181431345.png)
11. 等待一会后，选择`Reboot Now`，一会会提示你拔出安装媒介，不必操作按Enter，随后即可进入全新的Ubuntu Server
    ![](https://img.makis-life.cn/images/20251110181431346.png)
12. 输入用户名以及密码即可登录进入系统
    ![](https://img.makis-life.cn/images/20251110181431347.png)
    > [!warning]
    > 公网主机请勿展示sshkey

### 设置时区

ubuntuserver默认使用UTC时区，Hadoop对分布式节点时间要求很高，否则日志和任务调度会出错。
要么集群统一用UTC，但建议还是都调回东八区。

```
sudo apt install -y chrony
sudo systemctl enable chrony
sudo systemctl start chrony
sudo timedatectl set-timezone Asia/Shanghai
```

输入date回车，看见和自己主机时间一致即可。

### 安装基本软件

先执行

```bash
sudo apt update
```

```bash
sudo apt install -y wget curl vim nano zip unzip tar openssh-server htop lsof git build-essential sshpass
```

### (可选)Server配置无密码登录

执行

```bash
sudo systemctl edit getty@tty1.service
```

输入
![](https://img.makis-life.cn/images/20251110181431348.png)

> 这里user是用户名
> 在nano中，按Ctrl+x,输入Y,回车，即可保存并退出

重新加载systemd

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl restart getty@tty1.service
```
