## 一、Master 把公钥推给 Slave 的普通用户  
假设 Slave 的默认用户是 ubuntu 或 maki：

```
ssh-copy-id ubuntu@192.168.56.101
ssh-copy-id ubuntu@192.168.56.102
ssh-copy-id ubuntu@192.168.56.103
```

## 二、SSH 到 Slave，然后启用 root 密码  
在 Slave 上执行：

```
sudo passwd root
```

## 三、启用 root SSH 登录  
Ubuntu 默认禁止 root 通过 SSH 登录，你需要修改：

```
sudo nano /etc/ssh/sshd_config
```

找到：

```
#PermitRootLogin prohibit-password
```

改为：

```
PermitRootLogin yes
```

然后重启 SSH：

```
sudo systemctl restart ssh
```

## 四、把 key 推给 root  
在 Master 上执行：

```
ssh-copy-id root@192.168.56.101
ssh-copy-id root@192.168.56.102
ssh-copy-id root@192.168.56.103
```

