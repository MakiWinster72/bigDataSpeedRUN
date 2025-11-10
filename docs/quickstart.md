# 快速开始

欢迎使用大数据实验指导！本页面将帮助您快速了解项目概况并开始实验。

## 系统要求

下为本项目使用的系统/软件/组件版本：

| 名称 | 版本号 |
| -------------- | --------------- |
| Ubuntu | 24.04.03 LTS |
| Hadoop | 3.4.2 |
| HBase | 2.6.3 |
| ZooKeeper | 3.8.5 |
| Java | JDK 8u202 |

> **注意**：HBase 目前对 Java 11 以上的支持并不太好，建议使用 JDK 8

## 实验流程概览

### 1. 环境准备
- **虚拟机配置**：安装 Ubuntu 系统，配置网络和共享文件夹
- **基础软件**：安装 Java、SSH 等必要工具
- **文件传输**：掌握多种文件传输方式

### 2. Hadoop 实验
- **伪分布式模式**：单节点 Hadoop 环境搭建
- **完全分布式**：多节点 Hadoop 集群配置
- **HDFS 操作**：文件系统基本命令和使用

### 3. HBase 实验
- **HBase 安装**：在 Hadoop 基础上安装 HBase
- **Shell 操作**：HBase 基本命令和表操作
- **Java/Python API**：编程接口使用

### 4. 数据库实验
- **NoSQL 对比**：理解不同 NoSQL 数据库特性
- **云数据库**：RDS for MySQL 的使用
- **SQL 对比**：传统 SQL 与 NoSQL 的差异

### 5. MapReduce 编程
- **编程模型**：Map 和 Reduce 函数编写
- **案例实践**：词频统计、数据分析等

## 快速安装脚本

我们提供了自动化安装脚本，可以快速部署环境：

### Hadoop 伪分布式
```bash
wget https://res.makis-life.cn/shared/hadoopInstall.sh
chmod +x hadoopInstall.sh
./hadoopInstall.sh
```

### Hadoop 完全分布式
```bash
wget https://res.makis-life.cn/shared/hadoopCluster.sh
chmod +x hadoopCluster.sh
./hadoopCluster.sh
```

### HBase 安装
```bash
wget https://res.makis-life.cn/shared/hbaseInstall.sh
chmod +x hbaseInstall.sh
./hbaseInstall.sh
```

## 下载链接

前往[资源页面](./resources)获取所有组件的下载链接，包括：
- 操作系统镜像
- 大数据组件（Hadoop、HBase、ZooKeeper）
- Java 开发工具包
- 自动化安装脚本

## 开始实验

1. **新手入门**：从[实验一：虚拟机环境](./lab1/virtualMachine)开始
2. **环境搭建**：按照实验指导逐步配置环境
3. **实践操作**：完成每个实验的实践任务
4. **问题排查**：参考常见问题解决方法

## 注意事项

- 建议使用国内镜像站下载，避免网络问题
- 阿里云 ECS 用户可使用内网地址加速下载
- 实验过程中注意保存配置和备份数据
- 遇到问题可查看对应实验的详细说明

---

**准备好开始了吗？** 选择下面的实验开始您的学习之旅！

- [实验一：虚拟机环境](./lab1/virtualMachine)
- [实验二：Hadoop 集群](./lab1/hadoopInstall)
- [实验三：HBase](./lab3/hbaseInstall)
- [实验四：数据库与 NoSQL](./lab4/RDS)
- [实验五：MapReduce](./lab5/python)
