import DefaultTheme from "vitepress/theme-without-fonts";
import { onMounted } from "vue";
import mediumZoom from "medium-zoom";

import type { EnhanceAppContext } from "vitepress";
import "./custom.css";

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

      // 页面加载完成后初始化
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initZoom);
      } else {
        initZoom();
      }

      // 监听路由变化
      router.onAfterRouteChange = () => {
        setTimeout(initZoom, 100);
      };

      /**
       * 新增：在小屏幕上初始隐藏侧边栏，避免页面刚加载时短暂展开然后收起的闪烁。
       * 我们通过：1) 将侧边栏在小屏幕上初始设为不可见；2) 注入一个轻量级的切换按钮（右上角或左上角可见）
       * 用户点击该按钮时才显示侧边栏。这样不会干扰桌面端行为。
       */
      (function preventSidebarFlashOnSmallScreens() {
        const SMALL_BREAKPOINT = 1024;
        let toggleBtn: HTMLButtonElement | null = null;
        let initialized = false;

        const createToggleButton = () => {
          if (document.querySelector("#custom-sidebar-toggle"))
            return document.querySelector(
              "#custom-sidebar-toggle",
            ) as HTMLButtonElement;
          const btn = document.createElement("button");
          btn.id = "custom-sidebar-toggle";
          btn.type = "button";
          btn.title = "显示侧边栏";
          btn.innerText = "☰";
          Object.assign(btn.style, {
            position: "fixed",
            left: "12px",
            top: "12px",
            zIndex: "9999",
            width: "40px",
            height: "40px",
            borderRadius: "6px",
            border: "none",
            background: "#fff",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          } as any);
          document.body.appendChild(btn);
          return btn;
        };

        const ensureBehavior = () => {
          const sidebar = document.querySelector(
            ".VPSidebar",
          ) as HTMLElement | null;
          if (!sidebar) return;

          if (window.innerWidth <= SMALL_BREAKPOINT) {
            // 在小屏上初始隐藏侧边栏，避免闪烁
            if (!sidebar.dataset.__customInitialHidden) {
              sidebar.style.visibility = "hidden";
              sidebar.dataset.__customInitialHidden = "true";
            }

            // 注入切换按钮（仅在小屏上）
            toggleBtn = createToggleButton();
            if (toggleBtn && !toggleBtn.dataset.__listener) {
              toggleBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const hidden =
                  sidebar.dataset.__customHidden === "true" ||
                  sidebar.style.visibility === "hidden";
                if (hidden) {
                  // 展示侧边栏
                  sidebar.style.visibility = "visible";
                  sidebar.dataset.__customHidden = "false";
                  toggleBtn!.title = "隐藏侧边栏";
                } else {
                  // 隐藏侧边栏
                  sidebar.style.visibility = "hidden";
                  sidebar.dataset.__customHidden = "true";
                  toggleBtn!.title = "显示侧边栏";
                }
              });
              toggleBtn.dataset.__listener = "true";
            }

            // 点击侧边栏外部任意位置时自动收起（移动端友好）
            if (!document.body.dataset.__customOutsideListener) {
              document.addEventListener(
                "click",
                (ev) => {
                  const target = ev.target as Node | null;
                  if (!target) return;
                  const sidebarEl = document.querySelector(
                    ".VPSidebar",
                  ) as HTMLElement | null;
                  if (!sidebarEl) return;
                  const btnEl = document.querySelector(
                    "#custom-sidebar-toggle",
                  ) as HTMLElement | null;

                  // 如果侧边栏当前是打开的，并且点击目标既不在侧边栏也不在按钮上，则收起
                  const isOpen =
                    sidebarEl.style.visibility !== "hidden" &&
                    sidebarEl.dataset.__customHidden !== "true";
                  if (isOpen) {
                    if (
                      !sidebarEl.contains(target) &&
                      !(btnEl && btnEl.contains(target))
                    ) {
                      sidebarEl.style.visibility = "hidden";
                      sidebarEl.dataset.__customHidden = "true";
                      if (btnEl)
                        (btnEl as HTMLButtonElement).title = "显示侧边栏";
                    }
                  }
                },
                true,
              );
              document.body.dataset.__customOutsideListener = "true";
            }
          } else {
            // 宽屏恢复默认行为：移除我们的覆盖（保持原有 VitePress 行为）
            sidebar.style.visibility = "";
            delete sidebar.dataset.__customInitialHidden;
            delete sidebar.dataset.__customHidden;

            const btn = document.querySelector("#custom-sidebar-toggle");
            if (btn) btn.remove();
          }
        };

        // 初始化与响应窗口大小变化
        const onResize = () => {
          try {
            ensureBehavior();
          } catch (e) {
            // 忽略单次错误，确保不会阻塞页面
            // (不暴露错误细节给最终用户)
          }
        };

        window.addEventListener("resize", onResize);
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => {
            ensureBehavior();
            initialized = true;
          });
        } else {
          ensureBehavior();
          initialized = true;
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
