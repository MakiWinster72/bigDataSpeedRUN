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
      
      // 支持自定义容器
      const containerTypes = ['tip', 'warning', 'danger', 'info', 'note', 'todo']
      containerTypes.forEach(type => {
        md.use((md) => {
          md.renderer.rules[`container_${type}_open`] = (tokens, idx) => {
            return `<div class="custom-container ${type}">`
          }
          md.renderer.rules[`container_${type}_close`] = (tokens, idx) => {
            return '</div>'
          }
        })
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
        text: '实验二：HDFS ',
        items: [
          { text: 'Java ', link: '/lab2/java' },
          { text: 'Python ', link: '/lab2/python' }
        ]
      },
      {
        text: '实验三：HBase',
        items: [
          { text: 'HBase 安装', link: '/lab3/hbaseInstall' },
          { text: 'Java ', link: '/lab3/java' },
          { text: 'Python ', link: '/lab3/python' }
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
          { text: 'Python 编程', link: '/lab5/python' }
        ]
      },
      {
        text: '其他资料',
        items: [
          { text: '资源下载', link: '/resources' },
          { text: 'sh脚本一键安装', link: '/other/shell' },
          { text: '文件传输', link: '/other/sharedFileToVM' },
          { text: '领取ECS和RDS', link: '/other/freeECS' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/MakiWinster72/bigDataSpeedRUN' }
    ]
  }
})
