# 学生领取ECS服务器指南

## 目录
- [注册阿里云账号](#注册阿里云账号)
- [学生认证](#学生认证)
- [领取优惠券](#领取优惠券)
- [购买ECS实例](#购买ecs实例)
- [配置ECS实例](#配置ecs实例)
- [远程连接测试](#远程连接测试)
- [创建Ubuntu普通用户](#创建ubuntu普通用户并赋予-sudo-权限)

## 注册阿里云账号

访问[阿里云-云公开物](https://university.aliyun.com/)

![](https://img.makis-life.cn/article/yunkaitiangong.png)

点击之后，选择注册，使用电话号码注册。

## 学生认证

注册成功后刷新页面，再次点击"立即申请"，然后选择个人扫脸认证
![](https://img.makis-life.cn/article/aftersignin.png)

扫脸认证成功后刷新页面，再次点击"立即申请"，如果支付宝没有完成学生认证或者过期的话会出现以下界面
![](https://img.makis-life.cn/article/student.png)
![](https://img.makis-life.cn/article/failed.png)

认证过程注意确保阿里云的学生认证和支付宝的学生认证是否一致

## 领取优惠券

认证成功后，返回优惠券网页，点击申请就会跳转到下图（图里错了我们是9月18日，不过好像没关系）
![](https://img.makis-life.cn/article/aftersubmit.png)

## 购买ECS实例

领取成功后，来到这个页面[产品选购](https://university.aliyun.com/buycenter/?spm=5176.28623341)
找到这个  
![](https://img.makis-life.cn/article/15.png)  

按如下选择，如果有广州可以选广州。  
![](https://img.makis-life.cn/article/14.png)  
![](https://img.makis-life.cn/article/13.png)  
点击立即购买，一路确认就好。  

## 配置ECS实例

到这一步，点击管理控制台  
![](https://img.makis-life.cn/article/12.png)  

如果发现没有东西，那就是地域错了。  
![](https://img.makis-life.cn/article/11.png)  
然后点击名字进入实例。  

进入实例后在下方找到"更改宽带"  
![](https://img.makis-life.cn/article/9.png)  

![](https://img.makis-life.cn/article/7.png)  

返回后会多一个公网IP  
![](https://img.makis-life.cn/article/8.png)  

然后点击"重置密码"  
![](https://img.makis-life.cn/article/5.png)  
输入新密码，点击确认即可  

## 远程连接测试

现在测试一下能否用密码远程连接：点击页面右上角的"远程连接">WorkBench立即登录

这里选择`终端连接`，输入刚刚设置的密码，然后登录  
![](https://img.makis-life.cn/article/4.png)  
进入如下界面就是登录成功了（我这里系统是Arch,没默认安装对应的字体，所以看起来怪怪的）  
![](https://img.makis-life.cn/article/1.png)  

接下来可以打开电脑终端（cmd、powershell都可以）  

![](https://img.makis-life.cn/article/6.png)  
输入刚才的密码，输入yes，就登录成功啦！

## 创建Ubuntu普通用户并赋予 sudo 权限

① 添加用户（会自动创建 home 目录）：

```bash
sudo adduser 用户名
```

- 系统会提示输入并确认密码（这个密码可以设置很简单（虽然不推荐），因为后续要输出超级多遍...）
    
- 还会要求填写一些信息（可以全部直接回车跳过）
    

② 把用户加入 **sudo** 组：

```bash
sudo usermod -aG sudo 用户名
```

③ 确认用户在 sudo 组里：

```bash
groups 用户名
```

输出里如果有 `sudo` 就说明配置成功。

④ 切换用户测试：

```bash
su - 用户名
sudo ls /root
```

之后就可以ssh 用户名@公网ip登录了

> [!todo]
> RDS
