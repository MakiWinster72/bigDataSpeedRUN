# 基础配置

安装完 Arch Linux 后，需要进行一些基础配置来优化使用体验。

## 更新系统

首先更新系统到最新版本：

```bash
# 更新软件包数据库
sudo pacman -Syu

# 安装基础工具
sudo pacman -S base-devel git vim
```

## 配置 AUR 助手

AUR (Arch User Repository) 是 Arch Linux 的社区软件仓库，包含大量软件包。

### 安装 yay（推荐）
```bash
# 克隆 yay 源码
git clone https://aur.archlinux.org/yay.git
cd yay

# 编译安装
makepkg -si

# 清理
cd ..
rm -rf yay
```

### 配置 yay 使用国内镜像
```bash
# 编辑 yay 配置
yay --save --aururl "https://aur.tuna.tsinghua.edu.cn" --sortby votes --completionrefused
```

## 配置中文输入法

### 安装 fcitx5
```bash
# 安装 fcitx5 及相关组件
sudo pacman -S fcitx5-im fcitx5-chinese-addons fcitx5-gtk fcitx5-qt

# 安装输入法引擎
sudo pacman -S fcitx5-rime  # 小狼毫输入法
# 或者
sudo pacman -S fcitx5-sunpinyin  # 搜狗拼音
```

### 配置环境变量
编辑 `~/.pam_environment`：
```bash
nano ~/.pam_environment
```

添加以下内容：
```
INPUT_METHOD=fcitx5
GTK_IM_MODULE=fcitx5
QT_IM_MODULE=fcitx5
XMODIFIERS=@im=fcitx5
```

### 配置 fcitx5
```bash
# 创建配置目录
mkdir -p ~/.config/fcitx5

# 配置输入法
nano ~/.config/fcitx5/config
```

添加以下内容：
```
[General]
Name=default
Name[zh_CN]=默认

[Group]
Name=Default Group
Name[zh_CN]=默认分组
Default Layout=us
DefaultIM=rime

[Group/Items/0]
Name=keyboard-us
Name[zh_CN]=美式键盘

[Group/Items/1]
Name=rime
Name[zh_CN]=小狼毫

[Group/Items/1/Props]
Name=rime
Name[zh_CN]=小狼毫
```

### 启动 fcitx5
```bash
# 添加到自启动
echo 'fcitx5 -d' >> ~/.xprofile

# 或者手动启动
fcitx5 -d
```

## 配置字体

### 安装中文字体
```bash
# 安装常用中文字体
sudo pacman -S noto-fonts-cjk noto-fonts-emoji
sudo pacman -S wqy-microhei wqy-zenhei
sudo pacman -S ttf-dejavu ttf-liberation
```

### 配置字体渲染
创建字体配置：
```bash
sudo nano /etc/fonts/local.conf
```

添加以下内容：
```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <match target="font">
    <edit name="antialias" mode="assign">
      <bool>true</bool>
    </edit>
    <edit name="hinting" mode="assign">
      <bool>true</bool>
    </edit>
    <edit name="hintstyle" mode="assign">
      <const>hintslight</const>
    </edit>
    <edit name="rgba" mode="assign">
      <const>rgb</const>
    </edit>
  </match>
</fontconfig>
```

## 配置网络

### 使用 NetworkManager
```bash
# 启动 NetworkManager
sudo systemctl enable NetworkManager
sudo systemctl start NetworkManager

# 连接 WiFi
nmcli device wifi list
nmcli device wifi connect "网络名称" password "密码"

# 查看连接状态
nmcli connection show
```

### 配置静态 IP（可选）
```bash
# 编辑连接配置
sudo nmcli connection edit "连接名称"

# 在 nmcli 提示符下：
nmcli> set ipv4.addresses 192.168.1.100/24
nmcli> set ipv4.gateway 192.168.1.1
nmcli> set ipv4.dns 8.8.8.8,8.8.4.4
nmcli> set ipv4.method manual
nmcli> save
nmcli> quit
```

## 配置防火墙

### 安装和配置 UFW
```bash
# 安装 UFW
sudo pacman -S ufw

# 启用防火墙
sudo ufw enable

# 允许 SSH（如果使用）
sudo ufw allow ssh

# 查看状态
sudo ufw status
```

## 配置系统服务

### 启用常用服务
```bash
# 蓝牙
sudo systemctl enable bluetooth

# 音频
sudo systemctl enable --user pipewire pipewire-pulse

# 自动挂载
sudo systemctl enable udisks2
```

## 优化系统性能

### 配置 swap
```bash
# 创建 swap 文件（如果分区中没有 swap）
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 添加到 fstab
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 优化 pacman
编辑 `/etc/pacman.conf`：
```bash
sudo nano /etc/pacman.conf
```

取消注释以下行以启用并行下载：
```
ParallelDownloads = 5
```

## 创建用户目录

```bash
# 创建标准用户目录
mkdir -p ~/{Desktop,Documents,Downloads,Music,Pictures,Public,Templates,Videos}

# 设置权限
chmod 755 ~/{Desktop,Documents,Downloads,Music,Pictures,Public,Templates,Videos}
```

## 配置 Shell

### 安装 zsh（推荐）
```bash
# 安装 zsh
sudo pacman -S zsh

# 安装 oh-my-zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 设置 zsh 为默认 shell
chsh -s /bin/zsh
```

### 配置 zsh 主题和插件
编辑 `~/.zshrc`：
```bash
# 主题
ZSH_THEME="agnoster"

# 插件
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```

## 下一步

基础配置完成后，你可以：
- [安装桌面环境](/guide/desktop-env)
- [安装常用软件](/software/common)
- [解决常见问题](/troubleshooting/)
