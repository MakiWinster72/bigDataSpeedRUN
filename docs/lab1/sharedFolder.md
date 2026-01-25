本教程说明如何在主机以及Linux虚拟机之间建立共享文件夹。

## VMware

### ① 在 VMware 中启用共享文件夹

1. 打开虚拟机，但不要启动系统。
2. 点击菜单栏：**虚拟机(VM)** → **设置(Settings)**。
3. 选择 **选项(Options)** → **共享文件夹(Shared Folders)**。
4. 右侧选择：
   - 勾选 **始终启用(Always enabled)**
   - 点击 **添加(Add)** → 选择 Windows 主机上要共享的文件夹路径
   - 给它取个名字，比如 `shared`

5. 保存设置并启动虚拟机。

---

### ② 安装 VMware Tools（若未安装）

Ubuntu 虚拟机要能识别共享文件夹，必须安装 VMware Tools。

打开终端执行：

```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop -y
```

然后重启虚拟机：

```bash
sudo reboot
```

---

### ③ 手动挂载测试（确认功能正常）

重启后执行：

```bash
sudo mkdir -p /mnt/hgfs
sudo mount -t fuse.vmhgfs-fuse .host:/ /mnt/hgfs -o allow_other
```

如果命令成功执行，你会在 `/mnt/hgfs` 下看到刚才在 Windows 上设置的共享文件夹。

## VirtualBox

虚拟机打开时，点击左上角的`设备` -> `安装增强功能`
如果没有反应或者提示失败，可以自行[下载](https://download.virtualbox.org/virtualbox/)，选择最新的版本，此时是*VBoxGuestAdditions_7.2.4.iso*

进入虚拟机：

```
sudo apt update
sudo apt install -y build-essential dkms
```

下载好后再次点击`安装增强功能`即可。

在 VirtualBox 设置<u>共享文件夹</u>

1. 打开虚拟机 → 选择 设置 (Settings) → 共享文件夹 (Shared Folders)
2. 点击 添加文件夹 (Add Folder)
3. 文件夹路径 (Folder Path)：选择主机的文件夹
4. 文件夹名称 (Folder Name)：给虚拟机用的名称
5. 挂载点 (Mount Point)：注意文件夹需要存在
6. 自动挂载 (Auto-mount)：勾选
   ![](https://img.makis-life.cn/images/20251110181501335.png?x-oss-process=style/yasuo)

重启后查看是否已经挂载成功
*ls /mnt*
如果有出现主机上文件夹内的文件，那么已经成功。
如果没有输出，尝试手动挂载

```bash
sudo mount -t vboxsf (设置的Folder name) /mnt
```

这时候`ls /mnt`应当有显示文件夹内容了。

