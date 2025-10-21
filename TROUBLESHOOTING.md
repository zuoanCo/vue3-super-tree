# Vue3 Super Tree 故障排除指南

## 🔧 拖拽功能不工作的常见原因

### 1. ❌ CSS 样式未导入

**问题**: 这是最常见的问题！拖拽功能依赖于 CSS 样式。

```typescript
// ❌ 错误 - 只导入了组件，没有样式
import { Tree } from 'vue3-super-tree'

// ✅ 正确 - 必须同时导入样式
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'  // 这行是必须的！
```

### 2. ❌ 配置参数不完整

**问题**: 拖拽功能需要正确的配置参数。

```vue
<!-- ❌ 错误 - 缺少关键配置 -->
<Tree :value="data" />

<!-- ✅ 正确 - 完整的拖拽配置 -->
<Tree 
  :value="data"
  :dragdrop="true"                    <!-- 必须：启用拖拽 -->
  dragdrop-scope="unique-scope-name"  <!-- 必须：拖拽作用域 -->
  selection-mode="single"             <!-- 推荐：选择模式 -->
  @update:value="data = $event"       <!-- 必须：更新数据 -->
/>
```

### 3. ❌ 数据结构不正确

**问题**: TreeNode 数据结构缺少必要字段。

```typescript
// ❌ 错误 - 缺少必要字段
const data = [
  { name: 'Node 1' }  // 缺少 key 和 label
]

// ✅ 正确 - 完整的数据结构
const data: TreeNode[] = [
  {
    key: '1',           // 必须：唯一标识符
    label: 'Node 1',    // 必须：显示文本
    draggable: true,    // 可选：是否可拖拽（默认 true）
    droppable: true,    // 可选：是否可放置（默认 true）
    children: []        // 可选：子节点
  }
]
```

### 4. ❌ 跨树拖拽配置错误

**问题**: 跨树拖拽需要相同的作用域和组。

```vue
<!-- ❌ 错误 - 不同的作用域 -->
<Tree dragdrop-scope="scope1" cross-tree-group="group1" />
<Tree dragdrop-scope="scope2" cross-tree-group="group2" />

<!-- ✅ 正确 - 相同的作用域和组 -->
<Tree 
  id="tree1"
  dragdrop-scope="same-scope" 
  cross-tree-group="same-group"
  @cross-tree-move="handleCrossMove"
/>
<Tree 
  id="tree2"
  dragdrop-scope="same-scope" 
  cross-tree-group="same-group"
  @cross-tree-move="handleCrossMove"
/>
```

## 🔍 快速诊断步骤

### 步骤 1: 检查样式导入

在浏览器开发者工具中检查是否有 `.p-tree` 相关的 CSS 类：

```javascript
// 在浏览器控制台运行
console.log('CSS 样式检查:', {
  hasTreeStyles: !!document.querySelector('.p-tree'),
  hasNodeStyles: !!document.querySelector('.p-tree-node-content'),
  stylesheets: Array.from(document.styleSheets).length
})
```

### 步骤 2: 检查 DOM 属性

```javascript
// 检查节点是否具有拖拽属性
const nodes = document.querySelectorAll('.p-tree-node-content')
nodes.forEach((node, i) => {
  console.log(`节点 ${i}:`, {
    draggable: node.getAttribute('draggable'),
    hasTreeId: !!node.getAttribute('data-tree-id'),
    hasNodeKey: !!node.getAttribute('data-node-key')
  })
})
```

### 步骤 3: 检查配置

```vue
<template>
  <Tree 
    :value="data"
    :dragdrop="dragdropEnabled"
    :dragdrop-scope="scope"
    @mounted="checkConfig"
  />
</template>

<script setup>
const dragdropEnabled = ref(true)
const scope = ref('test-scope')

const checkConfig = () => {
  console.log('配置检查:', {
    dragdrop: dragdropEnabled.value,
    scope: scope.value,
    dataLength: data.value.length,
    hasValidKeys: data.value.every(node => node.key && node.label)
  })
}
</script>
```

## 🛠️ 常见解决方案

### 解决方案 1: 确保正确导入

```typescript
// main.ts 或组件文件中
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'  // 关键！

// 如果使用 Vite，确保在 vite.config.ts 中没有排除 CSS
export default defineConfig({
  css: {
    preprocessorOptions: {
      // 不要排除 node_modules 中的 CSS
    }
  }
})
```

### 解决方案 2: 检查构建配置

```javascript
// 如果使用 webpack，确保 CSS 加载器配置正确
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

### 解决方案 3: 手动验证安装

```bash
# 检查包是否正确安装
npm list vue3-super-tree

# 重新安装（如果需要）
npm uninstall vue3-super-tree
npm install vue3-super-tree@latest
```

## 📋 完整的工作示例

```vue
<template>
  <div class="app">
    <h1>拖拽测试</h1>
    
    <!-- 调试信息 -->
    <div class="debug-info">
      <p>拖拽启用: {{ dragdrop }}</p>
      <p>作用域: {{ scope }}</p>
      <p>节点数量: {{ treeData.length }}</p>
      <p>CSS 加载: {{ hasCSSLoaded }}</p>
    </div>
    
    <!-- 树组件 -->
    <Tree 
      :value="treeData"
      :dragdrop="dragdrop"
      :dragdrop-scope="scope"
      selection-mode="single"
      @update:value="treeData = $event"
      @node-drag-start="onDragStart"
      @node-drop="onDrop"
    />
    
    <!-- 事件日志 -->
    <div class="events">
      <h3>事件日志</h3>
      <div v-for="event in events" :key="event.id">
        {{ event.time }} - {{ event.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Tree } from 'vue3-super-tree'
import type { TreeNode } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

// 数据
const treeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '文档',
    children: [
      { key: '1-1', label: '文件1.txt' },
      { key: '1-2', label: '文件2.txt' }
    ]
  },
  {
    key: '2',
    label: '图片',
    children: [
      { key: '2-1', label: '图片1.jpg' }
    ]
  }
])

// 配置
const dragdrop = ref(true)
const scope = ref('test-scope')

// 事件日志
const events = ref<Array<{id: number, time: string, message: string}>>([])
let eventId = 0

const addEvent = (message: string) => {
  events.value.unshift({
    id: eventId++,
    time: new Date().toLocaleTimeString(),
    message
  })
  if (events.value.length > 5) {
    events.value = events.value.slice(0, 5)
  }
}

// 检查 CSS 是否加载
const hasCSSLoaded = computed(() => {
  if (typeof document === 'undefined') return false
  return !!document.querySelector('style, link[href*="vue3-super-tree"]') ||
         Array.from(document.styleSheets).some(sheet => {
           try {
             return Array.from(sheet.cssRules).some(rule => 
               rule.cssText.includes('.p-tree')
             )
           } catch {
             return false
           }
         })
})

// 事件处理
const onDragStart = (event: any) => {
  addEvent(`开始拖拽: ${event.node.label}`)
}

const onDrop = (event: any) => {
  addEvent(`放置节点: ${event.dragNode?.label}`)
}

// 生命周期
onMounted(() => {
  addEvent('组件已挂载')
  
  // 延迟检查 DOM
  setTimeout(() => {
    const nodeElements = document.querySelectorAll('.p-tree-node-content')
    addEvent(`找到 ${nodeElements.length} 个节点元素`)
    
    if (nodeElements.length > 0) {
      const firstNode = nodeElements[0]
      const draggable = firstNode.getAttribute('draggable')
      addEvent(`第一个节点 draggable: ${draggable}`)
    }
  }, 1000)
})
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.debug-info {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.debug-info p {
  margin: 5px 0;
  font-family: monospace;
}

.events {
  margin-top: 20px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
}

.events div {
  font-family: monospace;
  font-size: 0.9rem;
  margin: 2px 0;
}
</style>
```

## 🆘 仍然无法解决？

如果按照上述步骤仍然无法解决问题：

1. **检查浏览器控制台**是否有错误信息
2. **确认 Vue 版本**是否兼容（需要 Vue 3.0+）
3. **检查项目构建工具**配置（Vite/Webpack）
4. **尝试在新项目中测试**以排除项目配置问题
5. **查看 GitHub Issues** 或提交新的问题报告

## 📞 获取帮助

- GitHub Issues: [vue3-super-tree/issues](https://github.com/zuoanCo/vue3-super-tree/issues)
- 示例项目: 参考项目中的 `src/pages/DragTestPage.vue`
- 集成指南: 查看 `INTEGRATION_GUIDE.md`

---

**记住**: 90% 的拖拽问题都是因为没有导入 CSS 样式文件！