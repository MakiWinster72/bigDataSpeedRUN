import { defineConfig } from "vitepress";
import taskLists from "markdown-it-task-lists";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    breaks: true,
    config: (md) => {
      // 启用任务列表插件
      md.use(taskLists);

      // =======lazyLoading========
      // 将生成的 <img src="..."> 转为延迟加载形式：
      // - 把真实地址移动到 data-src / data-srcset
      // - 把 src / srcset 设置为小占位符
      // - 给图片添加 vp-lazy 类，供客户端 IntersectionObserver 使用
      const imageRule = md.renderer.rules.image;
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const src = token.attrGet("src");
        const srcset = token.attrGet("srcset");
        const placeholder =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

        if (src && !/^data:/.test(src)) {
          token.attrSet("data-src", src);
          token.attrSet("src", placeholder);
        }
        if (srcset) {
          token.attrSet("data-srcset", srcset);
          token.attrSet("srcset", "");
        }

        // 保留任何已有的类，但确保包含 vp-lazy
        const cls = token.attrGet("class") || "";
        if (!/\bvp-lazy\b/.test(cls)) {
          token.attrSet("class", (cls + " vp-lazy").trim());
        }

        // 仍然调用原渲染器以输出 html
        return imageRule(tokens, idx, options, env, self);
      };
    },
    image: {
      lazyLoading: true,
    },
  },

  // 网站基础信息
  title: "Big Data SpeedRUN",
  description: "A site that helps bigdata lab course.",
  base: "/bigdata/",
  ignoreDeadLinks: true,
  // Preload built font assets: during build VitePress will emit the fonts with hashed filenames.
  // transformHead finds those emitted assets and injects preload <link>s for better performance.
  transformHead({ assets }) {
    if (!assets || !Array.isArray(assets)) return [];
    // 找到构建产物中匹配 HurmitNerdFontMono-Regular 和 Recursive 的 woff2 文件（带 hash）
    const hurmit = assets.find((file: string) =>
      /HurmitNerdFontMono-Regular\.[\w-]+\.woff2$/.test(file),
    );
    const recursive = assets.find((file: string) =>
      /Recursive\.[\w-]+\.woff2$/.test(file),
    );
    const links: any[] = [];
    if (recursive) {
      links.push([
        "link",
        {
          rel: "preload",
          href: recursive,
          as: "font",
          type: "font/woff2",
          crossorigin: "",
        },
      ]);
    }
    if (hurmit) {
      links.push([
        "link",
        {
          rel: "preload",
          href: hurmit,
          as: "font",
          type: "font/woff2",
          crossorigin: "",
        },
      ]);
    }
    return links;
  },

  themeConfig: {
    outline: {
      level: [2, 3],
    },
    nav: [
      { text: "首页", link: "/" },
      { text: "资源", link: "/resources" },
    ],

    sidebar: [
      {
        text: "开始",
        link: "/quickstart",
      },
      {
        text: "实验一：虚拟机环境",
        items: [
          { text: "虚拟机配置", link: "/lab1/virtualMachine" },
          { text: "Hadoop 安装", link: "/lab1/hadoopInstall" },
          { text: "伪分布式模式", link: "/lab1/PseudoDistributed" },
          { text: "完全分布式", link: "/lab1/Cluster" },
        ],
      },
      {
        text: "实验二：HDFS",
        items: [
          { text: "HDFS Java", link: "/lab2/java" },
          { text: "HDFS Python", link: "/lab2/python" },
        ],
      },
      {
        text: "实验三：HBase",
        items: [
          { text: "HBase 安装", link: "/lab3/hbaseInstall" },
          { text: "HBase Java", link: "/lab3/java" },
          { text: "HBase Python", link: "/lab3/python" },
        ],
      },
      {
        text: "实验四：数据库与 NoSQL",
        items: [
          { text: "RDS for MySQL", link: "/lab4/RDS" },
          { text: "SQL 对比", link: "/lab4/SQLcompare" },
        ],
      },
      {
        text: "实验五：MapReduce",
        items: [
          { text: "MapReduce Python", link: "/lab5/python" },
          { text: "MapReduce Java", link: "/lab5/java" },
        ],
      },
      {
        text: "集群搭建实验报告",
        link: "/ClusterNote",
      },
      {
        text: "其他资料",
        items: [
          { text: "资源下载", link: "/resources" },
          { text: "sh脚本一键安装", link: "/other/shell" },
          { text: "共享文件夹", link: "/lab1/sharedFolder" },
          { text: "更多文件传输方式", link: "/lab1/otherWaysTransferFileToVM" },
          { text: "领取ECS", link: "/other/freeECS" },
          { text: "领取RDS", link: "/other/freeRDS" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/MakiWinster72/bigDataSpeedRUN",
      },
    ],
  },
});
