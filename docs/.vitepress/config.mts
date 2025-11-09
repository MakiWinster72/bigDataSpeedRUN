import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown:{
    breaks: true,
    config: (md) => {
      // 注册自定义组件
      md.use((md) => {
        // 替换图片渲染器
        const defaultRender = md.renderer.rules.image
        md.renderer.rules.image = (tokens, idx, options, env, self) => {
          const token = tokens[idx]
          const src = token.attrGet('src')
          const alt = token.content
          
          // 使用自定义组件代替默认的 img 标签
          return `<ImageLightbox src="${src}" alt="${alt}" />`
        }
      })
    }
  },
  title: "Big Data SpeedRUN",
  description: "A site that helps bigdata lab course.",
  base:'/bigdata/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
          { text: '首页', link: '/' },
          { text: '资源', link: '/resources' },
        ],

    sidebar: [
      {
        text: '实验一：虚拟机环境',
        items: [
          { text: '虚拟机配置', link: '/lab1/virtualMachine' }
        ]
      },
      {
        text: '实验二：Hadoop 集群',
        items: [
          { text: 'Hadoop 安装', link: '/lab2/hadoopInstall' },
          { text: 'Hadoop 集群搭建', link: '/lab2/hadoopCluster' }
        ]
      },
      {
        text: '实验三：HBase',
        items: [
          { text: 'HBase 基础', link: '/lab3/hbase' }
        ]
      },
      {
        text: '实验四：数据库与 NoSQL',
        items: [
          { text: 'NoSQL 概述', link: '/lab4/noSQL' },
          { text: 'RDS for MySQL', link: '/lab4/rds_for_mySQL' }
        ]
      },
      {
        text: '实验五：MapReduce',
        items: [
          { text: 'MapReduce 案例', link: '/lab5/mapReduce' }
        ]
      },
      {
        text: '其他资料',
        items: [
          { text: '资源', link: '/resources' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/MakiWinster72/bigDataSpeedRUN' }
    ]
  }
})
