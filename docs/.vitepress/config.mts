import { defineConfig } from 'vitepress'
import taskLists from 'markdown-it-task-lists'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    breaks: true,
    config: (md) => {
      // 启用任务列表插件
      md.use(taskLists)

    }
  },

  // 网站基础信息
  title: 'Big Data SpeedRUN',
  description: 'A site that helps bigdata lab course.',
  base: '/bigdata/',

  // ✅ 新增：构建时自动预加载字体
  transformHead({ assets }) {
    const myFontFile = assets.find(file =>
      /HurmitNerdFontMono-Bold\.[\w-]+\.(otf|woff2?)/.test(file)
    )
    if (myFontFile) {
      return [
        [
          'link',
          {
            rel: 'preload',
            href: myFontFile,
            as: 'font',
            type: 'font/otf',
            crossorigin: ''
          }
        ]
      ]
    }
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '资源', link: '/resources' }
    ],
    
    sidebar: [
      {
        text: '快速开始',
        link: '/quickstart',
        items: [
          { text: '系统要求', link: '/quickstart#系统要求' },
          { text: '实验流程', link: '/quickstart#实验流程概览' },
          { text: '安装脚本', link: '/quickstart#快速安装脚本' }
        ]
      },
      {
        text: '实验一：虚拟机环境',
        items: [
          { text: '虚拟机配置', link: '/lab1/virtualMachine' },
          { text: '共享文件夹', link: '/lab1/sharedFolder' },
          { text: '文件传输方式', link: '/lab1/otherWaysTransferFileToVM' },
          { text: 'Hadoop 安装', link: '/lab1/hadoopInstall' },
          { text: '伪分布式模式', link: '/lab1/PseudoDistributed' },
          { text: '完全分布式', link: '/lab1/Cluster' }
        ]
      },
      {
        text: '实验二：HDFS',
        items: [
          { text: 'HDFS Java', link: '/lab2/java' },
          { text: 'HDFS Python', link: '/lab2/python' }
        ]
      },
      {
        text: '实验三：HBase',
        items: [
          { text: 'HBase 安装', link: '/lab3/hbaseInstall' },
          { text: 'HBase Java', link: '/lab3/java' },
          { text: 'HBase Python', link: '/lab3/python' }
        ]
      },
      {
        text: '实验四：数据库与 NoSQL',
        items: [
          { text: 'RDS for MySQL', link: '/lab4/RDS' },
          { text: 'SQL 对比', link: '/lab4/SQLcompare' }
        ]
      },
      {
        text: '实验五：MapReduce',
        items: [
          { text: 'MapReduce Python', link: '/lab5/python' }
        ]
      },
      {
        text: '其他资料',
        items: [
          { text: '资源下载', link: '/resources' },
          { text: 'sh脚本一键安装', link: '/other/shell' },
          { text: '领取ECS', link: '/other/freeECS' },
          { text: '领取RDS', link: '/other/freeRDS' }
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/MakiWinster72/bigDataSpeedRUN' }
    ]
  }
})