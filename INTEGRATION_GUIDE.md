# Vue3 Super Tree 外部项目集成指南

## 🚀 快速开始

### 1. 安装

```bash
npm install vue3-super-tree
# 或
pnpm add vue3-super-tree
# 或
yarn add vue3-super-tree
```

### 2. 基本使用

#### 方式一：全局注册（推荐）

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { TreePlugin } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const app = createApp(App)
app.use(TreePlugin)
app.mount('#app')
```

#### 方式二：局部导入

```vue
<template>
  <Tree 
    :value="treeData" 
    :dragdrop="true" 
    dragdrop-scope="my-demo" 
    selection-mode="single" 
    cross-tree-group="my-demo" 
    @cross-tree-move="onCrossTreeMove" 
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import type { TreeNode } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const treeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '文档',
    children: [
      { key: '1-1', label: '项目计划.docx' },
      { key: '1-2', label: '会议记录.docx' }
    ]
  }
])

const onCrossTreeMove = (event: any) => {
  console.log('跨树移动:', event)
}
</script>
```

## 🔧 拖拽功能配置

### 基本拖拽配置

```vue
<template>
  <Tree 
    :value="treeData"
    :dragdrop="true"
    dragdrop-scope="unique-scope-name"
    selection-mode="single"
    @node-drag-start="onDragStart"
    @node-drag-end="onDragEnd"
    @node-drop="onDrop"
  />
</template>

<script setup lang="ts">
const onDragStart = (event: any) => {
  console.log('开始拖拽:', event.node.label)
}

const onDragEnd = (event: any) => {
  console.log('结束拖拽:', event.node.label)
}

const onDrop = (event: any) => {
  console.log('节点放置:', event)
  // 更新数据
  treeData.value = event.value
}
</script>
```

### 跨树拖拽配置

```vue
<template>
  <div class="trees-container">
    <!-- 源树 -->
    <Tree 
      id="source-tree"
      :value="sourceData"
      :dragdrop="true"
      dragdrop-scope="cross-tree-demo"
      cross-tree-group="cross-tree-demo"
      selection-mode="single"
      @cross-tree-move="onCrossTreeMove"
      @update:value="sourceData = $event"
    />
    
    <!-- 目标树 -->
    <Tree 
      id="target-tree"
      :value="targetData"
      :dragdrop="true"
      dragdrop-scope="cross-tree-demo"
      cross-tree-group="cross-tree-demo"
      selection-mode="single"
      @cross-tree-move="onCrossTreeMove"
      @update:value="targetData = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import type { TreeNode } from 'vue3-super-tree'

const sourceData = ref<TreeNode[]>([...])
const targetData = ref<TreeNode[]>([...])

const onCrossTreeMove = (event: any) => {
  console.log('跨树移动事件:', event)
  // 处理跨树移动逻辑
}
</script>
```

## ⚠️ 常见问题和解决方案

### 1. 拖拽功能不工作

**问题**: 节点无法拖拽或拖拽事件不触发

**可能原因和解决方案**:

#### A. CSS样式未正确导入
```typescript
// ❌ 错误 - 缺少样式导入
import { Tree } from 'vue3-super-tree'

// ✅ 正确 - 必须导入样式
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'
```

#### B. 配置参数不正确
```vue
<!-- ❌ 错误 - 缺少必要配置 -->
<Tree :value="data" />

<!-- ✅ 正确 - 完整拖拽配置 -->
<Tree 
  :value="data"
  :dragdrop="true"
  dragdrop-scope="unique-name"
  selection-mode="single"
/>
```

#### C. 节点数据结构问题
```typescript
// ❌ 错误 - 缺少必要字段
const data = [{ name: 'Node 1' }]

// ✅ 正确 - 包含必要字段
const data: TreeNode[] = [
  {
    key: '1',        // 必须：唯一标识
    label: 'Node 1', // 必须：显示文本
    draggable: true, // 可选：默认为true
    droppable: true  // 可选：默认为true
  }
]
```

### 2. 跨树拖拽不工作

**问题**: 无法在不同树之间拖拽节点

**解决方案**:

```vue
<!-- 确保两个树有相同的 dragdrop-scope 和 cross-tree-group -->
<Tree 
  id="tree1"
  :dragdrop="true"
  dragdrop-scope="same-scope"
  cross-tree-group="same-group"
  @cross-tree-move="handleCrossMove"
/>

<Tree 
  id="tree2"
  :dragdrop="true"
  dragdrop-scope="same-scope"
  cross-tree-group="same-group"
  @cross-tree-move="handleCrossMove"
/>
```

### 3. TypeScript 类型错误

**问题**: TypeScript 报告类型错误

**解决方案**:

```typescript
// 确保正确导入类型
import type { 
  TreeNode, 
  TreeNodeDropEvent,
  TreeCrossTreeMoveEvent 
} from 'vue3-super-tree'

// 正确的事件处理器类型
const onDrop = (event: TreeNodeDropEvent) => {
  // 处理拖拽放置
}

const onCrossTreeMove = (event: TreeCrossTreeMoveEvent) => {
  // 处理跨树移动
}
```

### 4. 样式冲突问题

**问题**: 组件样式与项目样式冲突

**解决方案**:

```css
/* 方案1: 使用CSS变量自定义样式 */
:root {
  --p-tree-background: #ffffff;
  --p-tree-text-color: #374151;
  --p-tree-selected-background: #dbeafe;
  --p-tree-drop-line-color: #3b82f6;
}

/* 方案2: 覆盖特定样式 */
.my-tree .p-tree-node-content {
  padding: 0.5rem;
  border-radius: 0.375rem;
}

/* 方案3: 使用作用域样式 */
.tree-container {
  --p-tree-indent: 1.5rem;
  --p-tree-node-height: 2.5rem;
}
```

## 📋 完整示例

### 基础拖拽示例

```vue
<template>
  <div class="tree-demo">
    <h2>基础拖拽示例</h2>
    <Tree 
      :value="treeData"
      :dragdrop="true"
      dragdrop-scope="basic-demo"
      selection-mode="single"
      class="demo-tree"
      @update:value="treeData = $event"
      @node-drag-start="onDragStart"
      @node-drag-end="onDragEnd"
      @node-drop="onDrop"
    />
    
    <div class="event-log">
      <h3>事件日志</h3>
      <div v-for="log in eventLogs" :key="log.id" class="log-item">
        {{ log.time }} - {{ log.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import type { TreeNode } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const treeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '文档',
    children: [
      { key: '1-1', label: '项目计划.docx' },
      { key: '1-2', label: '会议记录.docx' }
    ]
  },
  {
    key: '2',
    label: '图片',
    children: [
      { key: '2-1', label: '头像.jpg' },
      { key: '2-2', label: '背景.png' }
    ]
  }
])

const eventLogs = ref<Array<{id: number, time: string, message: string}>>([])
let logId = 0

const addLog = (message: string) => {
  eventLogs.value.unshift({
    id: logId++,
    time: new Date().toLocaleTimeString(),
    message
  })
  if (eventLogs.value.length > 10) {
    eventLogs.value = eventLogs.value.slice(0, 10)
  }
}

const onDragStart = (event: any) => {
  addLog(`开始拖拽: ${event.node.label}`)
}

const onDragEnd = (event: any) => {
  addLog(`结束拖拽: ${event.node.label}`)
}

const onDrop = (event: any) => {
  addLog(`节点放置: ${event.dragNode?.label} -> ${event.dropNode?.label}`)
}
</script>

<style scoped>
.tree-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.demo-tree {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 20px;
}

.event-log {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px;
}

.log-item {
  padding: 5px 0;
  font-family: monospace;
  font-size: 0.9rem;
  color: #374151;
}
</style>
```

### 跨树拖拽示例

```vue
<template>
  <div class="cross-tree-demo">
    <h2>跨树拖拽示例</h2>
    <div class="trees-container">
      <div class="tree-section">
        <h3>源树</h3>
        <Tree 
          id="source-tree"
          :value="sourceData"
          :dragdrop="true"
          dragdrop-scope="cross-demo"
          cross-tree-group="cross-demo"
          selection-mode="single"
          @cross-tree-move="onCrossTreeMove"
          @update:value="sourceData = $event"
        />
      </div>
      
      <div class="tree-section">
        <h3>目标树</h3>
        <Tree 
          id="target-tree"
          :value="targetData"
          :dragdrop="true"
          dragdrop-scope="cross-demo"
          cross-tree-group="cross-demo"
          selection-mode="single"
          @cross-tree-move="onCrossTreeMove"
          @update:value="targetData = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import type { TreeNode } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const sourceData = ref<TreeNode[]>([
  {
    key: 's1',
    label: '待处理文件',
    children: [
      { key: 's1-1', label: '报告.docx' },
      { key: 's1-2', label: '数据.xlsx' }
    ]
  }
])

const targetData = ref<TreeNode[]>([
  {
    key: 't1',
    label: '已处理文件',
    children: []
  },
  {
    key: 't2',
    label: '回收站',
    children: []
  }
])

const onCrossTreeMove = (event: any) => {
  console.log('跨树移动:', event)
  // 这里可以添加自定义的跨树移动逻辑
}
</script>

<style scoped>
.cross-tree-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.trees-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.tree-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
}

.tree-section h3 {
  margin-top: 0;
  color: #374151;
}
</style>
```

## 🔍 调试技巧

### 1. 启用调试模式

```typescript
// 在开发环境中启用详细日志
if (import.meta.env.DEV) {
  window.VUE3_SUPER_TREE_DEBUG = true
}
```

### 2. 检查DOM属性

```javascript
// 检查节点是否具有正确的拖拽属性
const checkDragAttributes = () => {
  const nodes = document.querySelectorAll('.p-tree-node-content')
  nodes.forEach((node, index) => {
    console.log(`Node ${index}:`, {
      draggable: node.getAttribute('draggable'),
      'data-tree-id': node.getAttribute('data-tree-id'),
      'data-node-key': node.getAttribute('data-node-key')
    })
  })
}
```

### 3. 监听所有拖拽事件

```vue
<Tree 
  @node-drag-start="console.log('drag-start', $event)"
  @node-drag-end="console.log('drag-end', $event)"
  @node-drop="console.log('drop', $event)"
  @cross-tree-move="console.log('cross-tree-move', $event)"
/>
```

## 📦 依赖要求

- Vue 3.0+
- TypeScript 4.0+ (可选，但推荐)
- 现代浏览器支持 (Chrome 60+, Firefox 60+, Safari 12+)

## 🆘 获取帮助

如果您遇到问题：

1. 检查本指南中的常见问题部分
2. 查看项目的 GitHub Issues
3. 参考项目中的示例代码
4. 确保您使用的是最新版本

## 📝 更新日志

- v1.4.2: 修复了 useCrossTreeManager 重复声明问题
- v1.4.1: 改进了跨树拖拽功能
- v1.4.0: 添加了跨树拖拽支持

---

**注意**: 确保在使用拖拽功能时，始终导入 CSS 样式文件，这是拖拽功能正常工作的必要条件。