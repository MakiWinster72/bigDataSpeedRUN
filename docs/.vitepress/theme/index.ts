import DefaultTheme from 'vitepress/theme-without-fonts'
import { onMounted } from 'vue'
import mediumZoom from 'medium-zoom'

import type { EnhanceAppContext } from 'vitepress'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    
  },
  setup() {
    onMounted(() => {
      // 自动为所有图片添加点击放大功能
      const initZoom = () => {
        const images = document.querySelectorAll('.vp-doc img:not(.medium-zoom-image)')
        images.forEach((imgElement) => {
          const img = imgElement as HTMLImageElement
          
          // 跳过已经处理过的图片
          if (img.classList.contains('medium-zoom-image')) return
          
          // 添加点击放大功能
          mediumZoom(img, {
            background: 'rgba(0, 0, 0, 0.8)',
            margin: 24,
            scrollOffset: 0,
            container: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0
            }
          })
          
          // 添加鼠标悬停效果
          img.style.cursor = 'zoom-in'
          img.style.transition = 'transform 0.2s ease'
          
          img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.02)'
            img.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
          })
          
          img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)'
            img.style.boxShadow = 'none'
          })
        })
      }
      
      // 初始化和路由变化后都重新初始化
      initZoom()
      
      // 监听路由变化
      const observer = new MutationObserver(() => {
        setTimeout(initZoom, 100)
      })
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    })
  }
}
