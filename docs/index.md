---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "大数据实验指导"
  tagline: "Hadoop · Spark · HBase · Hive · NoSQL · 云数据库"
  # tagline: "从入门到实战，构建完整大数据实验与分析平台"
  actions:
    - theme: brand
      text: "🚀 快速开始"
      link: /quickstart
    - theme: alt
      text: "实验资源"
      link: /resources

features:
  - title: "Hadoop 集群搭建"
    details: "学习如何配置与管理 Hadoop 分布式计算框架，掌握 NameNode、DataNode、YARN 的运行机制，完成多节点实验环境部署。"
  - title: "HDFS 分布式文件系统"
    details: "深入理解 HDFS 的数据存储与副本机制，掌握文件上传、下载与命令操作，为后续 MapReduce 与 Spark 提供数据基础。"
  - title: "HBase 非关系型数据库"
    details: "探索 HBase 的列式存储模型，掌握表设计、CRUD 操作与 Shell 命令使用，理解其在大规模数据管理中的优势。"
  - title: "NoSQL 数据管理"
    details: "对比常见 NoSQL 系统（如 MongoDB、Cassandra），理解键值存储、文档数据库与列族数据库的应用场景。"
  - title: "云数据库实验"
    details: "学习如何在云环境中部署与使用关系型与非关系型数据库，如 MySQL、RDS、以及分布式云存储方案。"
  - title: "MapReduce 编程与执行"
    details: "掌握 Map 与 Reduce 编程模型，实现词频统计、日志分析等实验任务，深入理解并行计算思想与任务调度原理。"

---

## 适用版本

本教程使用以下组件/软件版本：

| 名称        | 版本号          |
| --------- | ------------ |
| Ubuntu    | 24.04.03 LTS |
| Hadoop    | 3.4.2        |
| HBase     | 2.6.3        |
| ZooKeeper | 2.8.5        |

更多详细信息和下载链接请查看[快速开始](./quickstart)页面。

## TODO
- [ ] 实验1
	- [x] 虚拟机安装 ✅ 2025-11-08
		- [ ] Vmware🔼 🏁 
		- [x] VirtualBox ✅ 2025-11-08
		- [x] Desktop ✅ 2025-11-08
		- [x] Server ✅ 2025-11-09
		- [x] sharedFolder ✅ 2025-11-08
- [x] 实验2 ✅ 2025-11-10
- [x] 实验3 ✅ 2025-11-10
	- [ ] 优雅地关闭hbase
- [ ] 实验4
- [x] 实验5 ✅ 2025-11-10
#### other

- [ ] 集群⏫ 🏁 
##### shell
- [x] hadoop ✅ 2025-11-10
	- [x] cluster ✅ 2025-11-10
	- [x] Pseudo ✅ 2025-11-10
- [x] hbase ✅ 2025-11-10
- [ ] sql
- [ ] 集群🔽 

## 🤝 如何贡献

如果您想为这个项目做出贡献（增加问题、修复错误、添加实验内容等），请按照以下步骤：

1. **Fork 仓库** - 点击页面右上角的 "Fork" 按钮，将仓库复制到您的 GitHub 账户

2. **克隆仓库** - 将您 fork 的仓库克隆到本地：
   ```bash
   git clone https://github.com/您的用户名/bigDataSpeedRUN.git
   ```

3. **创建分支** - 为您的功能或修复创建一个新分支：
   ```bash
   git checkout -b feature/您的功能名称
   ```

4. **进行修改** - 在本地进行您的修改和改进

5. **提交更改** - 提交您的更改并推送到您的 fork：
   ```bash
   git add .
   git commit -m "描述本次更改"
   git push origin feature/您的功能名称
   ```

6. **创建 Pull Request** - 在 GitHub 上从您的分支创建一个 Pull Request 到原始仓库
### 贡献指南

- 添加适当的文档和注释
- 测试您的更改确保不会破坏现有功能
- 在 PR 描述中清晰说明您的更改内容和目的

