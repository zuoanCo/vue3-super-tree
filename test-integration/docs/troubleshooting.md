# Vue3 Super Tree 故障排除指南

## 常见问题与解决方案

### 1. 跨树拖拽问题

#### 问题：跨树拖拽时 `onNodeDrop` 事件不触发

**症状：**
- 同树拖拽正常工作
- 跨树拖拽时没有任何事件触发
- 控制台没有错误信息

**原因：**
- `dragdropScope` 配置不匹配
- 事件监听器绑定错误
- 全局拖拽状态管理问题

**解决方案：**

1. **检查 `dragdropScope` 配置**
```vue
<!-- 确保两个树使用相同的 scope -->
<Tree :dragdropScope="'shared-scope'" />
<Tree :dragdropScope="'shared-scope'" />
```

2. **正确监听跨树拖拽事件**
```vue
<template>
  <Tree
    :value="treeData"
    :dragdropScope="'shared-scope'"
    @cross-tree-drop="onCrossTreeDrop"
    @node-drop="onNodeDrop"
  />
</template>

<script setup>
const onCrossTreeDrop = (event) => {
  console.log('跨树拖拽事件:', event)
  // 处理跨树拖拽逻辑
}

const onNodeDrop = (event) => {
  console.log('节点拖拽事件:', event)
  // 处理同树拖拽逻辑
}
</script>
```

3. **检查事件对象结构**
```javascript
const onCrossTreeDrop = (event) => {
  console.log('事件对象:', {
    dragNode: event.dragNode,
    dropNode: event.dropNode,
    dropPosition: event.dropPosition,
    isCrossTree: event.isCrossTree,
    accept: typeof event.accept,
    reject: typeof event.reject
  })
}
```

#### 问题：拖拽节点信息丢失

**症状：**
- `event.dragNode` 为 `null` 或 `undefined`
- 无法获取拖拽节点的完整信息

**解决方案：**

1. **检查全局拖拽状态**
```javascript
import { globalDragState } from 'vue3-super-tree'

const onCrossTreeDrop = (event) => {
  // 如果 event.dragNode 为空，从全局状态获取
  const dragNode = event.dragNode || globalDragState.dragNode
  const dropPosition = event.dropPosition || globalDragState.dropPosition
  
  console.log('拖拽节点:', dragNode)
}
```

2. **添加调试日志**
```javascript
const onCrossTreeDrop = (event) => {
  console.group('🔍 跨树拖拽调试')
  console.log('原始事件:', event)
  console.log('全局状态:', globalDragState)
  console.log('拖拽节点:', event.dragNode)
  console.log('目标节点:', event.dropNode)
  console.groupEnd()
}
```

### 2. 样式问题

#### 问题：样式不生效

**症状：**
- 树组件显示但样式异常
- 拖拽时没有视觉反馈

**解决方案：**

1. **确保导入样式文件**
```javascript
import 'vue3-super-tree/dist/style.css'
```

2. **检查 CSS 优先级**
```css
/* 如果样式被覆盖，增加优先级 */
.tree-container .tree-node {
  /* 自定义样式 */
}
```

3. **使用 scoped 样式时的注意事项**
```vue
<style scoped>
/* 使用 :deep() 穿透样式 */
:deep(.tree-node) {
  /* 自定义样式 */
}
</style>
```

#### 问题：主题切换不生效

**解决方案：**

1. **正确的主题配置**
```vue
<template>
  <Tree :theme="currentTheme" />
</template>

<script setup>
import { ref } from 'vue'

const currentTheme = ref('dark')

const switchTheme = () => {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
}
</script>
```

2. **自定义主题对象**
```javascript
const customTheme = {
  backgroundColor: '#f5f5f5',
  textColor: '#333',
  hoverColor: '#e6f7ff',
  selectedColor: '#1890ff'
}
```

### 3. 性能问题

#### 问题：大数据量时渲染缓慢

**症状：**
- 初始渲染时间长
- 拖拽操作卡顿
- 页面响应慢

**解决方案：**

1. **使用虚拟滚动**
```vue
<Tree
  :value="largeTreeData"
  :virtualScroll="true"
  :itemHeight="32"
  :visibleItems="20"
/>
```

2. **懒加载子节点**
```vue
<Tree
  :value="treeData"
  :lazy="true"
  @node-expand="loadChildren"
/>
```

3. **优化数据结构**
```javascript
// 避免深层嵌套，使用扁平化结构
const flattenTree = (nodes) => {
  const result = []
  const traverse = (node, level = 0) => {
    result.push({ ...node, level })
    if (node.children) {
      node.children.forEach(child => traverse(child, level + 1))
    }
  }
  nodes.forEach(node => traverse(node))
  return result
}
```

4. **使用防抖优化搜索**
```javascript
import { debounce } from 'lodash-es'

const searchTree = debounce((keyword) => {
  // 搜索逻辑
}, 300)
```

### 4. TypeScript 类型问题

#### 问题：类型定义不正确

**解决方案：**

1. **正确导入类型**
```typescript
import type {
  TreeNode,
  TreeNodeSelectEvent,
  TreeNodeDropEvent,
  CrossTreeDropEvent
} from 'vue3-super-tree'
```

2. **扩展节点类型**
```typescript
interface CustomTreeNode extends TreeNode {
  customData?: {
    id: number
    type: string
  }
}
```

3. **事件处理器类型**
```typescript
const handleCrossTreeDrop = (event: CrossTreeDropEvent) => {
  // TypeScript 会提供完整的类型提示
}
```

### 5. 数据更新问题

#### 问题：数据更新后界面不刷新

**解决方案：**

1. **确保数据响应性**
```javascript
import { ref, reactive } from 'vue'

// 使用 ref
const treeData = ref([...])

// 或使用 reactive
const state = reactive({
  treeData: [...]
})
```

2. **正确更新数组**
```javascript
// 错误：直接修改数组
treeData.value.push(newNode)

// 正确：创建新数组
treeData.value = [...treeData.value, newNode]
```

3. **使用 key 强制更新**
```vue
<template>
  <Tree
    :key="treeKey"
    :value="treeData"
  />
</template>

<script setup>
const treeKey = ref(0)

const forceUpdate = () => {
  treeKey.value++
}
</script>
```

### 6. 事件处理问题

#### 问题：事件监听器不工作

**解决方案：**

1. **检查事件名称**
```vue
<!-- 正确的事件名称 -->
<Tree
  @node-select="onNodeSelect"
  @node-drop="onNodeDrop"
  @cross-tree-drop="onCrossTreeDrop"
/>
```

2. **事件处理器签名**
```javascript
// 确保参数正确
const onNodeSelect = (event) => {
  console.log('选中节点:', event.node)
}

const onCrossTreeDrop = (event) => {
  const { dragNode, dropNode, accept, reject } = event
  // 处理逻辑
}
```

## 调试工具

### 1. 开启调试模式

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

### 2. 使用 Vue DevTools

1. 安装 Vue DevTools 浏览器扩展
2. 在组件面板中查看 Tree 组件状态
3. 监控 props 和 events 变化

### 3. 自定义调试函数

```javascript
const debugTree = (label, data) => {
  console.group(`🌲 ${label}`)
  console.log('数据:', data)
  console.log('时间:', new Date().toISOString())
  console.trace('调用栈')
  console.groupEnd()
}

// 使用
debugTree('树数据更新', treeData.value)
```

## 配置检查清单

### 基础配置
- [ ] 正确导入组件和样式
- [ ] 数据结构符合 TreeNode 接口
- [ ] 事件监听器正确绑定

### 拖拽配置
- [ ] `dragdropScope` 在相关树之间保持一致
- [ ] 监听正确的拖拽事件
- [ ] 实现 `accept/reject` 回调

### 性能配置
- [ ] 大数据量时启用虚拟滚动
- [ ] 使用懒加载减少初始渲染
- [ ] 避免不必要的重新渲染

### TypeScript 配置
- [ ] 正确导入类型定义
- [ ] 事件处理器类型正确
- [ ] 自定义数据类型扩展

## 获取帮助

如果以上解决方案都无法解决您的问题，请：

1. 查看 [GitHub Issues](https://github.com/your-repo/vue3-super-tree/issues)
2. 提供完整的错误信息和复现步骤
3. 包含您的环境信息（Vue 版本、浏览器版本等）
4. 提供最小化的复现示例

## 版本兼容性

| Vue3 Super Tree | Vue.js | Node.js |
|----------------|--------|---------|
| 1.x.x          | ^3.2.0 | ^14.0.0 |
| 2.x.x          | ^3.3.0 | ^16.0.0 |

确保您的环境版本符合要求。