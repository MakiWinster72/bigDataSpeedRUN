# 快速开始

## 系统要求

下为本项目使用的系统/软件/组件版本：

| 名称      | 版本号       |
| --------- | ------------ |
| Ubuntu    | 24.04.03 LTS |
| Hadoop    | 3.4.2        |
| HBase     | 2.6.3        |
| ZooKeeper | 3.8.5        |
| Java      | jdk21        |

## 实验流程概览

### 1. 环境准备

- **虚拟机配置**：安装 Ubuntu 系统，配置网络和共享文件夹
- **基础软件**：安装 Java、SSH 等必要工具
- **文件传输**：掌握多种文件传输方式

### 2. HDFS 实验

- **伪分布式模式**：单节点 Hadoop 环境搭建
- **完全分布式**：多节点 Hadoop 集群配置
- **HDFS 操作**：文件系统基本命令和使用

### 3. HBase 实验

- **HBase 安装**：在 Hadoop 基础上安装 HBase
- **Shell 操作**：HBase 基本命令和表操作
- 编程接口使用

### 4. 数据库实验

- **云数据库**：RDS for MySQL 的使用
- **SQL 对比**：传统 SQL 与 NoSQL 的使用对比

### 5. MapReduce

- **编程模型**：Map 和 Reduce 函数编写
- **案例实践**：词频统计、数据分析等

## 资源

提供了自动化安装脚本，可以快速部署环境：

前往[资源页面](./resources)获取所有组件的下载链接，包括：

- 操作系统镜像
- 大数据组件（Hadoop、HBase、ZooKeeper）
- Java 开发工具包
- 自动化安装脚本

---

- [实验一：虚拟机安装](./lab1/virtualMachine)
- [实验二：Hadoop 集群安装与HDFS的常见命令](./lab1/hadoopInstall)
- [实验三：HBase与HBase Shell](./lab3/hbaseInstall).
- [实验四：云数据库与 NoSQL](./lab4/RDS)
- [实验五：MapReduce](./lab5/java)
