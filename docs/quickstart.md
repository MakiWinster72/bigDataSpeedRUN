# 开始

## 系统要求

本教程使用以下组件/软件版本：

| 软件名称      | 版本        |
| ------------- | ----------- |
| Ubuntu 虚拟机 | 24.04.4 LTS |
| Hadoop        | 3.4.2       |
| HBase         | 2.6.3       |
| Hive          | 4.2.0       |
| Zookeeper     | 3.8.5       |
| Spark         | 4.0.1       |
| Scala         | 2.13.16     |
| OpenJDK       | 21          |

## 实验流程概览

### 1. 环境准备

**虚拟机配置**：安装 Ubuntu 系统，配置网络和共享文件夹
**基础软件**：安装 Java、SSH 等必要工具
**文件传输**：掌握多种文件传输方式

### 2. HDFS 实验

**伪分布式模式**：单节点 Hadoop 环境搭建
**完全分布式**：多节点 Hadoop 集群配置
**HDFS 操作**：文件系统基本命令和使用

### 3. HBase 实验

**HBase 安装**：在 Hadoop 基础上安装 HBase
**Shell 操作**：HBase 基本命令和表操作
编程接口使用

### 4. 数据库实验

**云数据库**：RDS for MySQL 的使用
**SQL 对比**：传统 SQL 与 NoSQL 的使用对比

### 5. MapReduce

**编程模型**：Map 和 Reduce 函数编写
**案例实践**：词频统计、数据分析等

### 6. 集群搭建

## 资源

提供了自动化安装脚本，可以快速部署环境：
前往[资源页面](./resources)获取所有组件的下载链接，包括：

操作系统镜像
大数据组件（Hadoop、HBase、ZooKeeper 等）
Java 工具包
自动化安装脚本

## 索引

[实验1：虚拟机安装](./lab1/virtualMachine)
[实验2：Hadoop 集群安装与HDFS的常见命令](./lab1/hadoopInstall)
[实验3：HBase 安装与常见命令](./lab3/hbaseInstall)
[实验4.1：云数据库](./lab4/RDS)
[实验4.2：数据库比较](./lab4/RDS)
[实验5：MapReduce](./lab5/java)
[集群搭建](./ClusterNote)

