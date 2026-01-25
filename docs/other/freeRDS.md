## 领取 RDS 数据库

1. 进入[阿里云试用界面](https://free.aliyun.com/)
2. 搜索 RDS,个人有 7 个试用产品，但是都是同类型产品，只能选择一个试用
   ![](https://img.makis-life.cn/images/20251110181131201.jpeg)

   > 图中高亮的为符合实验四要求的 RDS 云数据库。选择一个申请即可。

3. 申请试用
   ![](https://img.makis-life.cn/images/20251110181131202.png?x-oss-process=style/yasuo)
   > [!note]
   > 若有 ECS 服务器，地域可以选择与 ECS 相同区域。
   > 》》实验要求 MySQL 5.6 但高可用只能选择 MySQL 8.0, 其实 8.0 也可以完成实验。

![](https://img.makis-life.cn/images/20251110181131203.png?x-oss-process=style/yasuo)

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
![](https://img.makis-life.cn/images/20251110181131204.png?x-oss-process=style/yasuo)

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

```bash
TODO
```

> [!note]
> 其中数据库地址是`rm...`很长的地址
> 用户名是刚才创建的普通用户
> 最后的`--ssl=0`意思是取消使用 ssl 协议，我们没有 ssl 证书

输入密码后即进入数据库，接下来就是与本地 MySQL 一样的操作了。
