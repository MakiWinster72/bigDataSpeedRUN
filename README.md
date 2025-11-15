# 大数据实验指导教程

一个全面的大数据技术实验教程，涵盖Hadoop、HDFS、HBase、NoSQL和云数据库等核心技术的实践操作。

## 📖 项目简介

本项目提供了一套完整的大数据技术实验指导，从环境搭建到实际应用，帮助学习者快速掌握大数据核心技术。教程包含详细的操作步骤、代码示例和最佳实践，适合初学者和有一定基础的学习者。

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

### 实验1：虚拟机环境搭建
- 虚拟机安装与配置
- 共享文件夹设置
- 文件传输方式
- Hadoop 安装与配置
- 伪分布式模式
- 完全分布式集群

### 实验2：HDFS 分布式文件系统
- HDFS 基本操作
- HDFS Java API
- HDFS Python API

### 实验3：HBase 非关系型数据库
- HBase 安装与配置
- HBase Shell 操作
- HBase Java API
- HBase Python API
- HBase 常见问题解决

### 实验4：数据库与 NoSQL
- RDS for MySQL 使用
- SQL 与 NoSQL 对比
- 云数据库实践

### 实验5：MapReduce 编程
- MapReduce 编程模型
- MapReduce Python 实现
- 实际案例分析

## 🛠️ 技术栈

| 名称 | 版本号 |
| -------------- | --------------- |
| Ubuntu | 24.04.03 LTS |
| Hadoop | 3.4.2 |
| HBase | 2.6.3 |
| ZooKeeper | 3.8.5 |
| Java | JDK 8u202 |

## 📦 一键安装脚本

项目提供了自动化安装脚本，可快速部署环境：

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

## 🌐 在线文档

完整的文档网站已部署，可通过以下链接访问：
- [在线文档](https://makiwinster72.github.io/bigDataSpeedRUN/)
- [快速开始](https://makiwinster72.github.io/bigDataSpeedRUN/quickstart)
- [资源下载](https://makiwinster72.github.io/bigDataSpeedRUN/resources)

## 🤝 贡献指南

欢迎为项目做出贡献！请按照以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

**MakiWinster72** - [GitHub](https://github.com/MakiWinster72)

## 🙏 致谢

- 感谢所有为大数据技术发展做出贡献的开发者们
- 感谢所有为本项目提供反馈和建议的用户

---

⭐ 如果这个项目对您有帮助，请给它一个星标！