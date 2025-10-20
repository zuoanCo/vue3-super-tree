<template>
  <div class="config-test">
    <h1>配置化功能测试</h1>
    
    <!-- 测试自定义国际化文本 -->
    <div class="test-section">
      <h2>自定义国际化文本测试</h2>
      <Tree
        :value="testData"
        :config="customI18nConfig"
        selection-mode="single"
        :draggable="true"
        class="test-tree"
      />
      <p>测试说明：展开/折叠按钮应显示自定义文本，拖拽时应显示自定义描述</p>
    </div>

    <!-- 测试自定义样式配置 -->
    <div class="test-section">
      <h2>自定义样式配置测试</h2>
      <Tree
        :value="testData"
        :config="customStyleConfig"
        selection-mode="single"
        class="test-tree"
      />
      <p>测试说明：节点应使用自定义的焦点和选中颜色</p>
    </div>

    <!-- 测试默认配置 -->
    <div class="test-section">
      <h2>默认配置测试</h2>
      <Tree
        :value="testData"
        selection-mode="single"
        :draggable="true"
        class="test-tree"
      />
      <p>测试说明：使用默认配置，应显示中文文本</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Tree from '../components/Tree.vue'
import type { TreeNode, TreeConfig } from '../lib/types'

// 测试数据
const testData = ref<TreeNode[]>([
  {
    key: 'test-1',
    label: '测试节点 1',
    children: [
      { key: 'test-1-1', label: '子节点 1-1' },
      { key: 'test-1-2', label: '子节点 1-2' }
    ]
  },
  {
    key: 'test-2',
    label: '测试节点 2',
    children: [
      { key: 'test-2-1', label: '子节点 2-1' }
    ]
  }
])

// 自定义国际化配置
const customI18nConfig = ref<TreeConfig>({
  i18n: {
    loading: 'Custom Loading...',
    noDataFound: 'Custom No Data',
    filterPlaceholder: 'Custom Search...',
    expand: 'Custom Expand',
    collapse: 'Custom Collapse',
    move: 'Custom Move {dragLabel}',
    moveBefore: 'Custom Move {dragLabel} before {dropLabel}',
    moveAfter: 'Custom Move {dragLabel} after {dropLabel}',
    moveInside: 'Custom Move {dragLabel} inside {dropLabel}',
    crossTreeOperation: 'Custom Cross Tree Operation'
  }
})

// 自定义样式配置
const customStyleConfig = ref<TreeConfig>({
  style: {
    focusBackgroundColor: '#ff6b6b',
    focusTextColor: '#ffffff',
    selectedBackgroundColor: '#4ecdc4',
    selectedTextColor: '#ffffff'
  }
})
</script>

<style scoped>
.config-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.test-tree {
  margin: 10px 0;
  max-height: 300px;
  overflow-y: auto;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #666;
  margin-bottom: 15px;
}

p {
  color: #888;
  font-size: 14px;
  margin-top: 10px;
}
</style>