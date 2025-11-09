<template>
  <div class="image-container">
    <img 
      :src="src" 
      :alt="alt" 
      class="clickable-image"
      @click="openLightbox"
    />
    
    <div v-if="showLightbox" class="lightbox" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <!-- 关闭按钮 - 固定在右上角 -->
        <button class="close-btn" @click="closeLightbox" title="关闭">×</button>
        
        <!-- 图片区域 -->
        <div class="image-wrapper" :style="{ transform: `scale(${zoomLevel})` }">
          <img 
            :src="src" 
            :alt="alt" 
            class="lightbox-image" 
            @wheel="handleWheel"
          />
        </div>
        
        <!-- 图片标题 -->
        <div class="image-caption" v-if="alt">{{ alt }}</div>
        
        <!-- 桌面端控制按钮 - 固定在屏幕底部 -->
        <div class="desktop-controls">
          <button class="control-btn" @click="zoomOut" title="缩小">-</button>
          <button class="control-btn" @click="resetZoom" title="重置">↺</button>
          <button class="control-btn" @click="zoomIn" title="放大">+</button>
          <div class="zoom-indicator" v-if="zoomLevel !== 1">
            {{ Math.round(zoomLevel * 100) }}%
          </div>
        </div>
        
        <!-- 移动端控制按钮 - 固定在屏幕边缘 -->
        <div class="mobile-controls">
          <button class="mobile-btn zoom-out-btn" @click="zoomOut" title="缩小">-</button>
          <button class="mobile-btn reset-btn" @click="resetZoom" title="重置">↺</button>
          <button class="mobile-btn zoom-in-btn" @click="zoomIn" title="放大">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  }
})

const showLightbox = ref(false)
const zoomLevel = ref(1)

const openLightbox = () => {
  showLightbox.value = true
  zoomLevel.value = 1
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  showLightbox.value = false
  zoomLevel.value = 1
  document.body.style.overflow = 'auto'
}

const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.25
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.25
  }
}

const resetZoom = () => {
  zoomLevel.value = 1
}

const handleWheel = (event) => {
  event.preventDefault()
  if (event.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// 键盘事件监听
const handleKeydown = (event) => {
  if (event.key === 'Escape' && showLightbox.value) {
    closeLightbox()
  }
  if (event.key === '+' && showLightbox.value) {
    event.preventDefault()
    zoomIn()
  }
  if (event.key === '-' && showLightbox.value) {
    event.preventDefault()
    zoomOut()
  }
  if (event.key === '0' && showLightbox.value) {
    event.preventDefault()
    resetZoom()
  }
}

// 添加和移除键盘事件监听器
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
.image-container {
  display: inline-block;
  max-width: 100%;
}

.clickable-image {
  cursor: zoom-in;
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.clickable-image:hover {
  transform: scale(1.02);
}

.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

/* 关闭按钮 - 固定在右上角 */
.close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  z-index: 1002;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.image-caption {
  color: white;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  max-width: 600px;
}

/* 桌面端控制按钮 - 固定在屏幕底部中央 */
.desktop-controls {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  z-index: 1001;
}

.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.3rem;
  font-weight: bold;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.zoom-indicator {
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  margin-left: 10px;
  min-width: 50px;
  text-align: center;
}

/* 移动端控制按钮 - 固定在屏幕边缘 */
.mobile-controls {
  display: none;
}

.image-wrapper {
  transition: transform 0.3s ease;
  transform-origin: center center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .lightbox-content {
    max-width: 95%;
  }
  
  .lightbox-image {
    max-height: 70vh;
  }
  
  .close-btn {
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  /* 隐藏桌面端控件，显示移动端控件 */
  .desktop-controls {
    display: none;
  }
  
  .mobile-controls {
    display: flex;
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    gap: 15px;
    z-index: 1001;
  }
  
  .mobile-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1.5rem;
    font-weight: bold;
    backdrop-filter: blur(10px);
  }
  
  .mobile-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
  
  /* 移动端缩放指示器 */
  .zoom-indicator {
    position: fixed;
    top: 60px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 8px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    backdrop-filter: blur(10px);
    z-index: 1001;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .mobile-controls {
    bottom: 15px;
    gap: 10px;
  }
  
  .mobile-btn {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
  
  .close-btn {
    top: 5px;
    right: 5px;
    width: 35px;
    height: 35px;
    font-size: 1.3rem;
  }
}
</style>
