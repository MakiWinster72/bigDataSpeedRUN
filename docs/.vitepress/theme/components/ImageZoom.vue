<template>
  <div class="image-zoom-wrapper">
    <img
      :src="src"
      :alt="alt"
      class="zoomable-image"
      @click="zoomImage"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import mediumZoom from 'medium-zoom'

interface Props {
  src: string
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: ''
})

const zoom = ref<any>(null)

const zoomImage = () => {
  if (zoom.value) {
    zoom.value.open()
  }
}

onMounted(() => {
  // 延迟初始化以确保图片已加载
  setTimeout(() => {
    const image = document.querySelector(`img[src="${props.src}"]`) as HTMLImageElement
    if (image) {
      zoom.value = mediumZoom(image, {
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
    }
  }, 100)
})

onUnmounted(() => {
  if (zoom.value) {
    zoom.value.detach()
  }
})
</script>

<style scoped>
.image-zoom-wrapper {
  display: inline-block;
  cursor: zoom-in;
}

.zoomable-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.zoomable-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
