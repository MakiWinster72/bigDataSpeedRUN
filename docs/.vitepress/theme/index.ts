import DefaultTheme from "vitepress/theme-without-fonts";
import { onMounted } from "vue";
import mediumZoom from "medium-zoom";

import type { EnhanceAppContext } from "vitepress";
import "./custom.css";
import "./use-fonts";

/* Import font assets so Vite processes them during build and emits hashed filenames.
   These imports ensure the fonts are included in the build assets and can be
   preloaded via transformHead. */
// Font assets are imported in use-fonts.ts so Vite will process them during build

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }: EnhanceAppContext) {
    // 在应用级别初始化图片缩放功能
    if (typeof window !== "undefined") {
      // 确保在客户端环境中执行
      const initZoom = () => {
        const images = document.querySelectorAll(
          ".vp-doc img:not(.medium-zoom-image)",
        );
        images.forEach((imgElement) => {
          const img = imgElement as HTMLImageElement;

          // 跳过已经处理过的图片
          if (img.classList.contains("medium-zoom-image")) return;

          // 添加点击放大功能
          mediumZoom(img, {
            background: "rgba(0, 0, 0, 0.8)",
            margin: 24,
            scrollOffset: 0,
            container: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          });

          // 添加鼠标悬停效果
          img.style.cursor = "zoom-in";
          img.style.transition = "transform 0.2s ease";

          img.addEventListener("mouseenter", () => {
            img.style.transform = "scale(1.02)";
            img.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          });

          img.addEventListener("mouseleave", () => {
            img.style.transform = "scale(1)";
            img.style.boxShadow = "none";
          });
        });
      };

      // 图片懒加载：使用 IntersectionObserver 在图片进入视口时才设置真实 src
      const initLazyLoad = (() => {
        let observer: IntersectionObserver | null = null;

        function ensureObserver() {
          if (observer) return observer;
          observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const img = entry.target as HTMLImageElement;
              const dataSrc = img.getAttribute("data-src");
              const dataSrcset = img.getAttribute("data-srcset");
              if (dataSrc) {
                img.src = dataSrc;
                img.removeAttribute("data-src");
              }
              if (dataSrcset) {
                img.srcset = dataSrcset;
                img.removeAttribute("data-srcset");
              }
              observer?.unobserve(img);
            });
          }, { rootMargin: "200px 0px" });
          return observer;
        }

        return () => {
          try {
            const obs = ensureObserver();
            // 首次将文档中的图片转换为延迟加载：把 src/srcset => data-src/data-srcset，并加上 vp-lazy 类
            const placeholder =
              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            document.querySelectorAll(".vp-doc img:not(.vp-lazy)").forEach((el) => {
              const img = el as HTMLImageElement;
              const src = img.getAttribute("src") || "";
              const srcset = img.getAttribute("srcset") || "";

              // 跳过内联资源或占位符
              if (!src || src.startsWith("data:") || src === placeholder) return;

              // 如果图片位于 <picture> 中，也把其 <source> 的 srcset 转为 data-srcset
              const picture = img.parentElement;
              if (picture && picture.tagName.toLowerCase() === "picture") {
                picture.querySelectorAll("source").forEach((s) => {
                  const ssrc = s.getAttribute("srcset");
                  if (ssrc) {
                    s.setAttribute("data-srcset", ssrc);
                    s.removeAttribute("srcset");
                  }
                });
              }

              // 移动真实地址到 data-* 并设置轻量占位符
              img.setAttribute("data-src", src);
              if (srcset) img.setAttribute("data-srcset", srcset);
              img.setAttribute("src", placeholder);
              img.removeAttribute("srcset");
              img.classList.add("vp-lazy");
            });

            // 观察所有标记为 vp-lazy 的图片
            document.querySelectorAll("img.vp-lazy").forEach((el) => {
              const img = el as HTMLImageElement;
              if (!img.getAttribute("data-src") && !img.getAttribute("data-srcset")) return;
              obs.observe(img);
            });
          } catch (e) {
            // 不支持 IntersectionObserver：降级到立即加载
            document.querySelectorAll("img.vp-lazy").forEach((el) => {
              const img = el as HTMLImageElement;
              const ds = img.getAttribute("data-src");
              const dss = img.getAttribute("data-srcset");
              if (ds) img.src = ds;
              if (dss) img.srcset = dss;
            });
          }
        };
      })();

      // 页面加载完成后初始化
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          // 先初始化懒加载（把真实 src 移到 data-src），再初始化缩放，避免缩放库触发真实图片的加载
          initLazyLoad();
          initZoom();
        });
      } else {
        initLazyLoad();
        initZoom();
      }

      // 监听路由变化
      router.onAfterRouteChange = () => {
        setTimeout(() => {
          initLazyLoad();
          initZoom();
        }, 100);
      };

      /**
       * 新增：在小屏幕上初始隐藏侧边栏，避免页面刚加载时短暂展开然后收起的闪烁。
       * 我们通过：1) 将侧边栏在小屏幕上初始设为不可见；2) 注入一个轻量级的切换按钮（右上角或左上角可见）
       * 用户点击该按钮时才显示侧边栏。这样不会干扰桌面端行为。
       */
      (function preventSidebarFlashOnSmallScreens() {
        // 改进：不注入新按钮（避免与主题自带按钮冲突）
        // - 在小屏上通过给根元素添加类初始隐藏侧边栏（.vp-sidebar-initial-hidden）
        // - 监听主题已有的切换按钮的首次点击，或监听侧边栏本身的属性/样式变化（更稳健）
        //   一旦检测到侧边栏被主题显示，则移除该根类并清理监听器。
        const SMALL_BREAKPOINT = 1024;
        const root = document.documentElement;
        const toggleSelectors = [
          'button[aria-label="Toggle sidebar"]',
          ".sidebar-toggle",
          ".theme-toggle",
          ".vp-nav__toggle",
          'button[aria-label="Menu"]',
          'button[title="Menu"]',
        ];
        let domObserver: MutationObserver | null = null;
        let sidebarObserver: MutationObserver | null = null;

        const addInitClass = () => {
          if (window.innerWidth <= SMALL_BREAKPOINT) {
            root.classList.add("vp-sidebar-initial-hidden");
          } else {
            root.classList.remove("vp-sidebar-initial-hidden");
          }
        };

        const cleanup = () => {
          // 移除根类并解绑所有监听器/观察器
          root.classList.remove("vp-sidebar-initial-hidden");
          toggleSelectors.forEach((sel) => {
            document.querySelectorAll(sel).forEach((el) => {
              el.removeEventListener("click", onUserToggle);
            });
          });
          window.removeEventListener("resize", onResize);
          if (domObserver) {
            domObserver.disconnect();
            domObserver = null;
          }
          if (sidebarObserver) {
            sidebarObserver.disconnect();
            sidebarObserver = null;
          }
        };

        const onUserToggle = () => {
          // 用户点击已有切换按钮：认为用户想查看侧边栏，移除初始化隐藏并清理监听
          cleanup();
        };

        const addToggleListeners = () => {
          toggleSelectors.forEach((sel) => {
            document.querySelectorAll(sel).forEach((el) => {
              // 绑定一次性监听（用户第一次交互即可）
              el.addEventListener("click", onUserToggle, { once: true });
            });
          });
        };

        function observeSidebarForVisibility() {
          try {
            const sidebar = document.querySelector(
              ".VPSidebar",
            ) as HTMLElement | null;
            if (!sidebar) return;

            // 先立即检测一次
            const isSidebarVisibleNow = () => {
              // 主题常用方式：data-visible="true" 或者可见性样式被设置
              const attrVisible = sidebar.getAttribute("data-visible");
              if (attrVisible === "true") return true;
              const cs = window.getComputedStyle(sidebar);
              if (
                cs &&
                cs.visibility !== "hidden" &&
                cs.display !== "none" &&
                cs.opacity !== "0"
              ) {
                return true;
              }
              // 另外检查是否类名中没有被我们期望的隐藏类
              if (
                !sidebar.classList.contains("vp-init-hidden") &&
                !sidebar.classList.contains("vp-sidebar-initial-hidden")
              ) {
                return true;
              }
              return false;
            };

            if (isSidebarVisibleNow()) {
              // 如果已经可见（比如主题已经在 DOMReady 之前设置好了），直接清理
              cleanup();
              return;
            }

            // 观察侧边栏属性与类的变化，一旦被主题显示则清理我们添加的初始隐藏
            sidebarObserver = new MutationObserver((mutations) => {
              for (const m of mutations) {
                if (m.type === "attributes") {
                  if (isSidebarVisibleNow()) {
                    cleanup();
                    return;
                  }
                } else if (m.type === "childList") {
                  if (isSidebarVisibleNow()) {
                    cleanup();
                    return;
                  }
                }
              }
            });

            sidebarObserver.observe(sidebar, {
              attributes: true,
              attributeFilter: ["class", "style", "data-visible"],
              childList: false,
              subtree: false,
            });
          } catch (err) {
            // 忽略观察错误以免影响主流程
          }
        }

        function onResize() {
          try {
            addInitClass();
            if (window.innerWidth > SMALL_BREAKPOINT) {
              // 宽屏下恢复默认行为并清理所有监听
              cleanup();
            }
          } catch (e) {
            // 忽略错误
          }
        }

        // 观察 DOM 变动，以便在主题稍后插入切换按钮或侧边栏时能绑定
        domObserver = new MutationObserver(() => {
          addToggleListeners();
          // 也尝试开始观察侧边栏可见性变化（如果主题已经插入侧边栏）
          observeSidebarForVisibility();
        });
        domObserver.observe(document.body, { childList: true, subtree: true });

        window.addEventListener("resize", onResize);

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => {
            addInitClass();
            addToggleListeners();
            observeSidebarForVisibility();
          });
        } else {
          addInitClass();
          addToggleListeners();
          observeSidebarForVisibility();
        }
      })();
    }
  },
  setup() {
    onMounted(() => {
      // 客户端二次初始化，确保在开发环境正常工作
      if (typeof window !== "undefined") {
        const initZoom = () => {
          const images = document.querySelectorAll(
            ".vp-doc img:not(.medium-zoom-image)",
          );
          images.forEach((imgElement) => {
            const img = imgElement as HTMLImageElement;

            // 跳过已经处理过的图片
            if (img.classList.contains("medium-zoom-image")) return;

            // 添加点击放大功能
            mediumZoom(img, {
              background: "rgba(0, 0, 0, 0.8)",
              margin: 24,
              scrollOffset: 0,
              container: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
              },
            });
          });
        };

        // 初始化和路由变化后都重新初始化
        initZoom();

        // 监听路由变化
        const observer = new MutationObserver(() => {
          setTimeout(initZoom, 100);
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }
    });
  },
};
