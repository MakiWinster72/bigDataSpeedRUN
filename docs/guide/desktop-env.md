# 桌面环境

Arch Linux 支持多种桌面环境，这里介绍几个主流的桌面环境安装和配置。

## 桌面环境选择

### GNOME
- **特点**：现代化设计，功能完整，适合新手
- **资源占用**：中等
- **推荐用户**：喜欢简洁现代界面的用户

### KDE Plasma
- **特点**：高度可定制，功能丰富
- **资源占用**：中等
- **推荐用户**：喜欢自定义和功能丰富的用户

### XFCE
- **特点**：轻量级，稳定，资源占用少
- **资源占用**：低
- **推荐用户**：老机器或喜欢简洁的用户

### i3wm
- **特点**：平铺式窗口管理器，高效
- **资源占用**：极低
- **推荐用户**：键盘控和效率追求者

## 安装显示服务器

### 安装 Xorg
```bash
# 安装 Xorg
sudo pacman -S xorg-server xorg-xinit

# 安装显卡驱动（根据你的显卡选择）
# Intel 集成显卡
sudo pacman -S xf86-video-intel

# NVIDIA 显卡
sudo pacman -S nvidia nvidia-utils

# AMD 显卡
sudo pacman -S xf86-video-amdgpu
```

### 安装 Wayland（可选）
```bash
# 安装 Wayland 相关组件
sudo pacman -S wayland wayland-protocols
```

## 安装 GNOME

### 基础安装
```bash
# 安装 GNOME 桌面环境
sudo pacman -S gnome

# 安装额外组件
sudo pacman -S gnome-extra

# 启用 GDM 显示管理器
sudo systemctl enable gdm
```

### 配置 GNOME
```bash
# 安装 GNOME 扩展管理器
sudo pacman -S gnome-shell-extensions

# 安装常用扩展
sudo pacman -S gnome-shell-extension-appindicator
sudo pacman -S gnome-shell-extension-dash-to-dock
```

### 启动 GNOME
```bash
# 重启系统
sudo reboot

# 或者手动启动
sudo systemctl start gdm
```

## 安装 KDE Plasma

### 基础安装
```bash
# 安装 KDE Plasma
sudo pacman -S plasma kde-applications

# 安装显示管理器
sudo pacman -S sddm

# 启用 SDDM
sudo systemctl enable sddm
```

### 配置 KDE
```bash
# 安装额外主题和组件
sudo pacman -S kde-gtk-config
sudo pacman -S sddm-kcm

# 安装中文语言包
sudo pacman -S kde-l10n-zh_cn
```

### 启动 KDE
```bash
# 重启系统
sudo reboot
```

## 安装 XFCE

### 基础安装
```bash
# 安装 XFCE
sudo pacman -S xfce4 xfce4-goodies

# 安装显示管理器
sudo pacman -S lightdm lightdm-gtk-greeter

# 启用 LightDM
sudo systemctl enable lightdm
```

### 配置 XFCE
```bash
# 安装额外组件
sudo pacman -S xfce4-whiskermenu-plugin
sudo pacman -S xfce4-screenshooter
sudo pacman -S xfce4-clipman-plugin
```

### 启动 XFCE
```bash
# 重启系统
sudo reboot
```

## 安装 i3wm

### 基础安装
```bash
# 安装 i3wm
sudo pacman -S i3-wm i3status i3lock

# 安装额外工具
sudo pacman -S dmenu rofi feh picom
```

### 配置 i3wm
```bash
# 生成配置文件
mkdir -p ~/.config/i3
cp /etc/i3/config ~/.config/i3/

# 编辑配置
nano ~/.config/i3/config
```

基础配置示例：
```
# 设置 Mod 键为 Super
set $mod Mod4

# 启动终端
bindsym $mod+Return exec alacritty

# 启动应用菜单
bindsym $mod+d exec rofi -show drun

# 退出 i3
bindsym $mod+Shift+e exec "i3-nagbar -t warning -m 'You pressed the exit shortcut. Do you really want to exit i3? This will end your X session.' -b 'Yes, exit i3' 'i3-msg exit'"

# 重启 i3
bindsym $mod+Shift+r restart

# 重新加载配置
bindsym $mod+Shift+c reload
```

### 启动 i3wm
```bash
# 编辑 ~/.xinitrc
echo 'exec i3' > ~/.xinitrc

# 启动 X
startx
```

## 安装 Hyprland（现代 Wayland 合成器）

### 基础安装
```bash
# 安装 Hyprland
sudo pacman -S hyprland

# 安装必要组件
sudo pacman -S waybar rofi wofi alacritty
```

### 配置 Hyprland
```bash
# 创建配置目录
mkdir -p ~/.config/hypr

# 创建基础配置
nano ~/.config/hypr/hyprland.conf
```

基础配置示例：
```
# 输入配置
input {
    kb_layout = us
    kb_variant =
    kb_model =
    kb_options =
    kb_rules =

    follow_mouse = 1
    touchpad {
        natural_scroll = no
    }
}

# 显示器配置
monitor=,preferred,auto,auto

# 窗口规则
windowrule = float, ^(pavucontrol)$
windowrule = float, ^(blueman-manager)$

# 启动程序
exec-once = waybar
exec-once = fcitx5 -d

# 绑定键
bind = SUPER, Return, exec, alacritty
bind = SUPER, D, exec, rofi -show drun
bind = SUPER, Shift, Q, killactive,
bind = SUPER, M, exit,
```

### 启动 Hyprland
```bash
# 编辑 ~/.xinitrc
echo 'exec Hyprland' > ~/.xinitrc

# 启动
startx
```

## 配置显示管理器

### 切换显示管理器
```bash
# 查看已安装的显示管理器
ls /usr/lib/systemd/system/display-manager.service

# 禁用当前显示管理器
sudo systemctl disable gdm  # 或 sddm, lightdm

# 启用新的显示管理器
sudo systemctl enable sddm  # 或 gdm, lightdm
```

## 配置自动登录

### GDM 自动登录
```bash
# 编辑 GDM 配置
sudo nano /etc/gdm/custom.conf
```

取消注释并修改：
```
[daemon]
AutomaticLogin=username
AutomaticLoginEnable=true
```

### SDDM 自动登录
```bash
# 编辑 SDDM 配置
sudo nano /etc/sddm.conf
```

添加：
```
[Autologin]
User=username
Session=plasma.desktop
```

## 安装主题和图标

### 安装主题
```bash
# 安装 Arc 主题
sudo pacman -S arc-gtk-theme

# 安装 Papirus 图标
sudo pacman -S papirus-icon-theme

# 安装字体
sudo pacman -S ttf-roboto ttf-roboto-mono
```

### 配置主题
```bash
# 创建 GTK 配置
mkdir -p ~/.config/gtk-3.0
nano ~/.config/gtk-3.0/settings.ini
```

添加：
```ini
[Settings]
gtk-theme-name=Arc-Dark
gtk-icon-theme-name=Papirus-Dark
gtk-font-name=Roboto 10
```

## 性能优化

### 禁用不必要的服务
```bash
# 禁用蓝牙（如果不使用）
sudo systemctl disable bluetooth

# 禁用打印服务（如果不使用）
sudo systemctl disable cups
```

### 配置显卡
```bash
# 查看显卡信息
lspci | grep VGA

# 安装对应驱动
# Intel: xf86-video-intel
# NVIDIA: nvidia
# AMD: xf86-video-amdgpu
```

## 下一步

桌面环境安装完成后，你可以：
- [安装常用软件](/software/common)
- [配置开发环境](/software/dev-tools)
- [解决显示问题](/troubleshooting/)
