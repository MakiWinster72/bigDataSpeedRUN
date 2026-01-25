# 领取 ECS 服务器指南

## 注册阿里云账号

访问[阿里云-云公开物](https://university.aliyun.com/)

![](https://img.makis-life.cn/article/yunkaitiangong.png?x-oss-process=style/yasuo)

点击之后，选择注册，使用电话号码注册。

## 学生认证

注册成功后刷新页面，再次点击"立即申请"，然后选择个人扫脸认证
![](https://img.makis-life.cn/article/aftersignin.png?x-oss-process=style/yasuo)

扫脸认证成功后刷新页面，再次点击"立即申请"，如果支付宝没有完成学生认证或者过期的话会出现以下界面
![](https://img.makis-life.cn/article/student.png?x-oss-process=style/yasuo)
![](https://img.makis-life.cn/article/failed.png?x-oss-process=style/yasuo)

认证过程注意确保阿里云的学生认证和支付宝的学生认证是否一致

## 领取优惠券

认证成功后，返回优惠券网页，点击申请就会跳转到下图（图里错了我们是 9 月 18 日，不过好像没关系）
![](https://img.makis-life.cn/article/aftersubmit.png?x-oss-process=style/yasuo)

## 购买 ECS 实例

领取成功后，来到这个页面[产品选购](https://university.aliyun.com/buycenter/?spm=5176.28623341)
找到这个  
![](https://img.makis-life.cn/article/15.png?x-oss-process=style/yasuo)

按如下选择，如果有广州可以选广州。  
![](https://img.makis-life.cn/article/14.png?x-oss-process=style/yasuo)  
![](https://img.makis-life.cn/article/13.png?x-oss-process=style/yasuo)  
点击立即购买，一路确认就好。

## 配置 ECS 实例

到这一步，点击管理控制台  
![](https://img.makis-life.cn/article/12.png?x-oss-process=style/yasuo)

如果发现没有东西，那就是地域错了。  
![](https://img.makis-life.cn/article/11.png?x-oss-process=style/yasuo)  
然后点击名字进入实例。

进入实例后在下方找到"更改宽带"  
![](https://img.makis-life.cn/article/9.png?x-oss-process=style/yasuo)

![](https://img.makis-life.cn/article/7.png?x-oss-process=style/yasuo)

返回后会多一个公网 IP  
![](https://img.makis-life.cn/article/8.png?x-oss-process=style/yasuo)

然后点击"重置密码"  
![](https://img.makis-life.cn/article/5.png?x-oss-process=style/yasuo)  
输入新密码，点击确认即可

## 远程连接测试

现在测试一下能否用密码远程连接：点击页面右上角的"远程连接">WorkBench 立即登录

这里选择`终端连接`，输入刚刚设置的密码，然后登录  
![](https://img.makis-life.cn/article/4.png?x-oss-process=style/yasuo)  
进入如下界面就是登录成功了（我这里系统是 Arch,没默认安装对应的字体，所以看起来怪怪的）  
![](https://img.makis-life.cn/article/1.png?x-oss-process=style/yasuo)

接下来可以打开电脑终端（cmd、powershell 都可以）

![](https://img.makis-life.cn/article/6.png?x-oss-process=style/yasuo)  
输入刚才的密码，输入 yes，就登录成功啦！

## 创建 Ubuntu 普通用户并赋予 sudo 权限

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

之后就可以 ssh 用户名@公网 ip 登录了

> [!todo]
> RDS

# 领取 RDS 数据库

1. 进入[阿里云试用界面](https://free.aliyun.com/)
2. 搜索 RDS,个人有 7 个试用产品，但是都是同类型产品，只能选择一个试用
   ![](https://img.makis-life.cn/images/20251110181147259.jpeg)

   > 图中高亮的为符合实验四要求的 RDS 云数据库。选择一个申请即可。

3. 申请试用
   ![](https://img.makis-life.cn/images/20251110181147260.png?x-oss-process=style/yasuo)
   > [!note]
   > 若有 ECS 服务器，地域可以选择与 ECS 相同区域。
   > 》》实验要求 MySQL 5.6 但高可用只能选择 MySQL 8.0, 其实 8.0 也可以完成实验。

![](https://img.makis-life.cn/images/20251110181147261.png?x-oss-process=style/yasuo)

> [!warning]
> 若要与 ECS 服务器走内网，请确保选择相同的 vps 网络

## 管理 RDS

### 新增用户

1. 前往[RDS 控制台](https://rdsnext.console.aliyun.com/dashboard/cn-hangzhou?spm=5176.29188366.overview_recent.2.e91c3e4dqRZgZG)
2. 在左侧选中“实例列表”点击刚刚购买的实例
3. 点击左侧“账号管理”
4. 创建一个**普通账号**（或高可用账号，第五步即可跳过）
5. 点击“数据库管理”，创建一个数据库，并且授权账号选择刚刚的普通账号

### 连接数据库

#### 控制页面

点击右上角的“登录数据库”，即可进入 RDS 管理页面，在此处可清晰直观地查看和管理我们的云数据库
![](https://img.makis-life.cn/images/20251110181147262.png?x-oss-process=style/yasuo)

#### 本地电脑远程连接

1. 点击左侧“数据库连接”，点击“开通外网地址”，这时会得到一长串地址，我们就通过这个在本地机器连接数据库
2. 点击外网地址后面的“设置白名单”，添加白名单分组`0.0.0.0`

   > 下方的 warning 没关系，数据库不存重要数据以及还是很少有概率攻击我们的，而且实验用数据库被攻击了也没什么关系，和我们虚拟机设置非常简单的密码同理。

3. 回到本地机器，windows 打开 cmd，linux 任意终端即可。

##### linux

```bash
mariadb -h 数据库地址 -P 3306 -u 用户名 -p --ssl=0
```

##### windows

TODO

> [!note]
> 其中数据库地址是`rm...`很长的地址
> 用户名是刚才创建的普通用户
> 最后的`--ssl=0`意思是取消使用 ssl 协议，我们没有 ssl 证书

输入密码后即进入数据库，接下来就是与本地 MySQL 一样的操作了。
