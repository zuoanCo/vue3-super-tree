<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { TreePine, ArrowRight, Github, Star } from 'lucide-vue-next'
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <TreePine :size="64" class="text-green-600" />
        </div>
        <h1 class="hero-title">
          PrimeVue Tree Plugin
        </h1>
        <p class="hero-subtitle">
          完美复刻 PrimeVue Tree 组件的 Vue 3 + TypeScript 插件
        </p>
        <p class="hero-description">
          支持基础展示、选择模式、拖拽排序、懒加载、过滤、自定义模板等所有 PrimeVue Tree 功能特性
        </p>
        
        <div class="hero-actions">
          <RouterLink to="/demo" class="btn-primary">
            <span>查看演示</span>
            <ArrowRight :size="16" />
          </RouterLink>
          <RouterLink to="/auto-update" class="btn-secondary">
            <span>自动更新示例</span>
            <ArrowRight :size="16" />
          </RouterLink>
          <RouterLink to="/cross-tree-demo" class="btn-secondary">
            <span>跨树拖拽演示</span>
            <ArrowRight :size="16" />
          </RouterLink>
          <RouterLink to="/diagnosis" class="btn-secondary">
            <span>拖拽诊断工具</span>
            <ArrowRight :size="16" />
          </RouterLink>
          <a href="https://github.com" class="btn-secondary" target="_blank">
            <Github :size="16" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="container">
        <h2 class="features-title">核心特性</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <TreePine :size="24" class="text-blue-600" />
            </div>
            <h3 class="feature-title">完整功能</h3>
            <p class="feature-description">
              完美复刻 PrimeVue Tree 的所有功能，包括展示、选择、拖拽、过滤等
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <Star :size="24" class="text-yellow-600" />
            </div>
            <h3 class="feature-title">TypeScript 支持</h3>
            <p class="feature-description">
              完整的 TypeScript 类型定义，提供优秀的开发体验和类型安全
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <ArrowRight :size="24" class="text-green-600" />
            </div>
            <h3 class="feature-title">Vue 3 组合式 API</h3>
            <p class="feature-description">
              基于 Vue 3 Composition API 构建，支持现代化的开发模式
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <Github :size="24" class="text-purple-600" />
            </div>
            <h3 class="feature-title">模块化设计</h3>
            <p class="feature-description">
              采用 Composables 架构，代码结构清晰，易于维护和扩展
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Start Section -->
    <div class="quickstart-section">
      <div class="container">
        <h2 class="quickstart-title">快速开始</h2>
        <div class="quickstart-content">
          <div class="code-block">
            <div class="code-header">
              <span>安装</span>
            </div>
            <pre class="code-content"><code>npm install vue-primevue-tree
# 或
pnpm add vue-primevue-tree</code></pre>
          </div>
          
          <div class="code-block">
            <div class="code-header">
              <span>使用</span>
            </div>
            <pre class="code-content"><code>&lt;template&gt;
  &lt;Tree :value="treeData" selection-mode="single" /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { Tree } from 'vue-primevue-tree'

const treeData = {
  '1': { key: '1', label: '节点 1' },
  '2': { key: '2', label: '节点 2' }
}
&lt;/script&gt;</code></pre>
          </div>
        </div>
        
        <div class="quickstart-actions">
          <RouterLink to="/demo" class="btn-primary">
            查看完整演示
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p class="footer-text">
          Built with ❤️ using Vue 3 + TypeScript + Vite
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-page {
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100;
}

.hero-section {
  @apply flex items-center justify-center min-h-screen px-4;
}

.hero-content {
  @apply text-center max-w-4xl mx-auto;
}

.hero-icon {
  @apply mb-8;
}

.hero-title {
  @apply text-5xl md:text-6xl font-bold text-gray-900 mb-6;
}

.hero-subtitle {
  @apply text-xl md:text-2xl text-gray-700 mb-4;
}

.hero-description {
  @apply text-lg text-gray-600 mb-8 max-w-2xl mx-auto;
}

.hero-actions {
  @apply flex flex-col sm:flex-row items-center justify-center gap-4;
}

.btn-primary {
  @apply inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold;
  @apply hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl;
}

.btn-secondary {
  @apply inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold;
  @apply hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl border border-gray-200;
}

.features-section {
  @apply py-20 bg-white;
}

.container {
  @apply max-w-6xl mx-auto px-4;
}

.features-title {
  @apply text-3xl font-bold text-center text-gray-900 mb-12;
}

.features-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8;
}

.feature-card {
  @apply text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200;
}

.feature-icon {
  @apply mb-4;
}

.feature-title {
  @apply text-xl font-semibold text-gray-900 mb-3;
}

.feature-description {
  @apply text-gray-600 leading-relaxed;
}

.quickstart-section {
  @apply py-20 bg-gray-50;
}

.quickstart-title {
  @apply text-3xl font-bold text-center text-gray-900 mb-12;
}

.quickstart-content {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12;
}

.code-block {
  @apply bg-gray-900 rounded-lg overflow-hidden shadow-lg;
}

.code-header {
  @apply px-4 py-2 bg-gray-800 text-gray-300 text-sm font-medium;
}

.code-content {
  @apply p-4 text-green-400 text-sm overflow-x-auto;
}

.quickstart-actions {
  @apply text-center;
}

.footer {
  @apply py-8 bg-gray-900;
}

.footer-text {
  @apply text-center text-gray-400;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    @apply text-4xl;
  }
  
  .hero-subtitle {
    @apply text-lg;
  }
  
  .features-grid {
    @apply grid-cols-1 gap-6;
  }
  
  .quickstart-content {
    @apply grid-cols-1;
  }
}
</style>
