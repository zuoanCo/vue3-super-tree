# Vue3 Super Tree 使用指南

## 快速开始

### 安装

```bash
npm install vue3-super-tree
```

### 基础使用

```vue
<template>
  <div>
    <Tree
      :value="treeData"
      selectionMode="single"
      @node-select="onNodeSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/dist/style.css'

const treeData = ref([
  {
    key: '1',
    label: '根节点 1',
    children: [
      { key: '1-1', label: '子节点 1-1' },
      { key: '1-2', label: '子节点 1-2' }
    ]
  },
  {
    key: '2',
    label: '根节点 2',
    children: [
      { key: '2-1', label: '子节点 2-1' }
    ]
  }
])

const onNodeSelect = (event) => {
  console.log('选中节点:', event.node)
}
</script>
```

## 跨树拖拽配置

### 基本配置

```vue
<template>
  <div class="tree-container">
    <!-- 源树 -->
    <Tree
      :value="sourceData"
      :dragdropScope="'shared-scope'"
      @cross-tree-drop="onCrossTreeDrop"
    />
    
    <!-- 目标树 -->
    <Tree
      :value="targetData"
      :dragdropScope="'shared-scope'"
      @cross-tree-drop="onCrossTreeDrop"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'

const sourceData = ref([...])
const targetData = ref([...])

const onCrossTreeDrop = (event) => {
  const { dragNode, dropNode, dropPosition, accept, reject } = event
  
  // 验证拖拽操作
  if (canDrop(dragNode, dropNode)) {
    // 更新数据
    updateTreeData(dragNode, dropNode, dropPosition)
    accept() // 接受拖拽
  } else {
    reject() // 拒绝拖拽
  }
}

const canDrop = (dragNode, dropNode) => {
  // 自定义验证逻辑
  return true
}

const updateTreeData = (dragNode, dropNode, position) => {
  // 自定义数据更新逻辑
}
</script>
```

### 高级配置

```vue
<template>
  <Tree
    :value="treeData"
    :dragdropScope="'my-scope'"
    :autoUpdateOnDrop="false"
    @node-drop="onNodeDrop"
    @cross-tree-drop="onCrossTreeDrop"
  />
</template>

<script setup>
const onNodeDrop = (event) => {
  // 同树拖拽处理
  console.log('同树拖拽:', event)
}

const onCrossTreeDrop = (event) => {
  // 跨树拖拽处理
  console.log('跨树拖拽:', event)
  
  // 手动数据更新
  if (validateDrop(event)) {
    performDataUpdate(event)
    event.accept()
  } else {
    event.reject()
  }
}
</script>
```

## 常见配置选项

### 选择模式

```vue
<!-- 单选 -->
<Tree selectionMode="single" />

<!-- 多选 -->
<Tree selectionMode="multiple" />

<!-- 复选框 -->
<Tree selectionMode="checkbox" />
```

### 主题配置

```vue
<!-- 深色主题 -->
<Tree theme="dark" />

<!-- 浅色主题 -->
<Tree theme="light" />

<!-- 自定义主题 -->
<Tree :theme="customTheme" />
```

### 拖拽配置

```vue
<Tree
  :dragdropScope="'my-scope'"
  :autoUpdateOnDrop="true"
  :allowDragToRoot="true"
  :allowDropToEmpty="true"
/>
```

## TypeScript 支持

### 类型定义

```typescript
import type {
  TreeNode,
  TreeNodeSelectEvent,
  TreeNodeDropEvent,
  CrossTreeDropEvent
} from 'vue3-super-tree'

// 节点数据类型
const node: TreeNode = {
  key: 'unique-key',
  label: '节点标签',
  children: [],
  data: { /* 自定义数据 */ }
}

// 事件处理
const handleSelect = (event: TreeNodeSelectEvent) => {
  console.log(event.node, event.originalEvent)
}

const handleDrop = (event: TreeNodeDropEvent) => {
  console.log(event.dragNode, event.dropNode, event.dropPosition)
}

const handleCrossTreeDrop = (event: CrossTreeDropEvent) => {
  console.log(event.dragNode, event.dropNode, event.isCrossTree)
}
```

### 组件 Props 类型

```typescript
interface TreeProps {
  value: TreeNode[]
  selectionMode?: 'single' | 'multiple' | 'checkbox'
  theme?: 'light' | 'dark' | object
  dragdropScope?: string
  autoUpdateOnDrop?: boolean
  allowDragToRoot?: boolean
  allowDropToEmpty?: boolean
}
```

## 最佳实践

### 1. 数据结构设计

```javascript
// 推荐的数据结构
const treeData = [
  {
    key: 'unique-id', // 必须唯一
    label: '显示文本',
    children: [], // 子节点数组
    data: {}, // 自定义数据
    icon: 'icon-name', // 可选图标
    disabled: false, // 是否禁用
    expanded: true // 是否展开
  }
]
```

### 2. 性能优化

```vue
<template>
  <!-- 使用 v-memo 优化大数据渲染 -->
  <Tree
    :value="treeData"
    :key="treeKey"
    v-memo="[treeData]"
  />
</template>

<script setup>
import { computed, ref } from 'vue'

// 使用计算属性缓存处理后的数据
const processedData = computed(() => {
  return processTreeData(rawData.value)
})

// 避免频繁更新，使用防抖
import { debounce } from 'lodash-es'

const updateTree = debounce((newData) => {
  treeData.value = newData
}, 300)
</script>
```

### 3. 错误处理

```javascript
const onCrossTreeDrop = (event) => {
  try {
    // 验证数据
    if (!event.dragNode || !event.dropNode) {
      throw new Error('拖拽节点数据无效')
    }
    
    // 执行操作
    updateTreeData(event)
    event.accept()
    
  } catch (error) {
    console.error('跨树拖拽失败:', error)
    event.reject()
    
    // 显示用户友好的错误信息
    showErrorMessage('拖拽操作失败，请重试')
  }
}
```

### 4. 状态管理

```javascript
// 使用 Pinia 管理树状态
import { defineStore } from 'pinia'

export const useTreeStore = defineStore('tree', {
  state: () => ({
    sourceTree: [],
    targetTree: [],
    selectedNodes: [],
    dragState: null
  }),
  
  actions: {
    updateTreeData(treeId, newData) {
      this[treeId] = newData
    },
    
    handleCrossTreeDrop(event) {
      // 统一的跨树拖拽处理逻辑
    }
  }
})
```

## 调试技巧

### 1. 启用调试模式

```vue
<template>
  <Tree
    :value="treeData"
    :debug="true"
    @debug="onDebug"
  />
</template>

<script setup>
const onDebug = (debugInfo) => {
  console.log('调试信息:', debugInfo)
}
</script>
```

### 2. 监控拖拽状态

```javascript
// 监控全局拖拽状态
import { globalDragState } from 'vue3-super-tree'

watch(globalDragState, (state) => {
  console.log('拖拽状态变化:', state)
}, { deep: true })
```

### 3. 事件日志

```javascript
const logEvent = (eventName, event) => {
  console.group(`🌲 Tree Event: ${eventName}`)
  console.log('Event:', event)
  console.log('Node:', event.node)
  console.log('Timestamp:', new Date().toISOString())
  console.groupEnd()
}

const onNodeSelect = (event) => {
  logEvent('node-select', event)
}

const onCrossTreeDrop = (event) => {
  logEvent('cross-tree-drop', event)
}
```

## 常见问题解决

参见 [故障排除指南](./troubleshooting.md) 获取详细的问题解决方案。