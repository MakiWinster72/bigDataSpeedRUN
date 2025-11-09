import DefaultTheme from 'vitepress/theme'
import ImageLightbox from '../components/ImageLightbox.vue'
import type { EnhanceAppContext } from 'vitepress'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    // 全局注册图片灯箱组件
    app.component('ImageLightbox', ImageLightbox)
  }
}
