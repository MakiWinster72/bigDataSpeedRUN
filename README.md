# 大数据实验指导教程

本项目提供了大数据技术原理课程所涉及的五个实验以及完全分布式搭建的教程。包含Hadoop、HBase、Hive、Spark等大数据生态系统的安装与配置指导。

## 🛠️ 使用版本

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

## 🚀 快速开始

### 克隆项目

```bash
git clone https://github.com/MakiWinster72/bigDataSpeedRUN.git
cd bigDataSpeedRUN
```

### 安装依赖

```bash
npm install
```

### 启动文档网站

```bash
npm run docs:dev
```

访问 `http://localhost:5173` 查看完整文档。

## 📚 实验内容

### 1. 环境准备

**虚拟机配置**：安装 Ubuntu 系统，配置网络和共享文件夹
**基础软件**：安装 Java、SSH 等必要工具
**文件传输**：掌握主机和虚拟机间多种文件传输方式

### 2. HDFS 实验

**伪分布式模式**：单节点 Hadoop 环境搭建
**完全分布式**：多节点 Hadoop 集群配置
**HDFS 操作**：文件系统基本命令和使用

### 3. HBase 实验

**HBase 安装**：在 Hadoop 基础上安装 HBase
**Shell 操作**：HBase 基本命令和表操作

### 4. 数据库实验

**云数据库**：RDS for MySQL 的使用
**SQL 对比**：传统 SQL 与 NoSQL 的使用对比

### 5. MapReduce

**编程模型**：Map 和 Reduce 函数编写
**案例实践**：词频统计、数据分析等

### 6. 集群搭建

## 贡献名单

23250102226
23251104102
23251104104

## 🤝 贡献指南

欢迎为项目做出贡献！请按照以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证

