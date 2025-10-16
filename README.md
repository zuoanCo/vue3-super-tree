# Vue3 Super Tree

[![npm version](https://badge.fury.io/js/vue3-super-tree.svg)](https://badge.fury.io/js/vue3-super-tree)
[![npm downloads](https://img.shields.io/npm/dm/vue3-super-tree.svg)](https://www.npmjs.com/package/vue3-super-tree)
[![GitHub license](https://img.shields.io/github/license/zuoanCo/vue3-super-tree.svg)](https://github.com/zuoanCo/vue3-super-tree/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

一个功能强大、高度可定制的 Vue 3 树形组件 npm 包，完全复刻 PrimeVue Tree 的功能特性，支持拖拽、多选、键盘导航等高级功能。

## 📄 协议

本项目采用 [MIT 协议](./LICENSE) 开源，您可以自由使用、修改和分发本项目。

## 🆕 v1.3.1 更新亮点

- **修复跨树拖拽状态残留问题** - 修复跨树拖拽后展开文件夹时仍显示拖拽选中样式的问题
- **增强全局拖拽状态管理** - 确保拖拽状态完全重置，避免状态残留
- **优化多Tree组件状态同步** - 改进多个Tree组件间的状态同步机制
- **改进UI状态清理** - 完善拖拽操作完成后的UI状态清理逻辑

## 🚀 特性

### 核心功能
- **树形数据展示** - 支持无限层级的树形结构
- **节点展开/折叠** - 可控制的节点展开状态
- **多种选择模式** - 单选、多选、复选框三种选择模式
- **双向绑定** - 完整的 v-model 支持
- **自定义图标** - 支持节点图标、展开/折叠图标自定义

### 高级功能
- **智能拖拽排序** - 同树内节点拖拽重排，支持自动数据更新
- **跨树拖拽** - 支持在不同树组件间拖拽节点
- **自动更新模式** - 拖拽操作自动更新数据源，无需手动处理
- **跨树拖拽自动更新** - 完善的跨树拖拽数据同步，支持自动更新和手动确认两种模式
- **键盘导航** - 完整的键盘操作支持（方向键、Enter、Space等）
- **节点过滤** - 实时搜索和过滤节点
- **懒加载** - 支持动态加载子节点
- **原生焦点管理** - 基于浏览器原生 :focus 伪类的焦点样式
- **自定义样式** - 支持主题定制和样式覆盖

### 技术特性
- **Vue 3 + Composition API** - 现代化的 Vue 3 开发体验
- **TypeScript** - 完整的类型定义和类型安全
- **Tailwind CSS** - 现代化的样式系统
- **响应式设计** - 适配各种屏幕尺寸
- **事件钩子系统** - 丰富的事件回调支持
- **无障碍访问** - 完整的 ARIA 支持
- **生产优化** - 生产构建自动移除调试日志，优化性能

## 📦 安装

```bash
# 使用 npm
npm install vue3-super-tree

# 使用 yarn
yarn add vue3-super-tree

# 使用 pnpm
pnpm add vue3-super-tree
```

## 🚀 快速开始

### 基础使用

```vue
<template>
  <div>
    <Tree 
      :value="nodes" 
      :selectionMode="'single'"
      v-model:selectionKeys="selectedKeys"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const nodes = ref([
  {
    key: '0',
    label: '根节点',
    children: [
      {
        key: '0-0',
        label: '子节点 1'
      },
      {
        key: '0-1',
        label: '子节点 2'
      }
    ]
  }
])

const selectedKeys = ref({})
</script>
```

### 完整功能示例

```vue
<template>
  <div>
    <Tree 
      :value="nodes"
      :selectionMode="'multiple'"
      :filter="true"
      :dragdrop="true"
      :loading="loading"
      v-model:selectionKeys="selectedKeys"
      v-model:expandedKeys="expandedKeys"
      @node-select="onNodeSelect"
      @node-unselect="onNodeUnselect"
      @node-expand="onNodeExpand"
      @node-collapse="onNodeCollapse"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const nodes = ref([...]) // 你的树形数据
const selectedKeys = ref({})
const expandedKeys = ref({})
const loading = ref(false)

const onNodeSelect = (node) => {
  console.log('节点选中:', node)
}

const onNodeUnselect = (node) => {
  console.log('节点取消选中:', node)
}

const onNodeExpand = (node) => {
  console.log('节点展开:', node)
}

const onNodeCollapse = (node) => {
  console.log('节点折叠:', node)
}
</script>
```

### TypeScript 支持

```typescript
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import type { TreeNode, TreeSelectionKeys, TreeExpandedKeys } from 'vue3-super-tree/types'
import 'vue3-super-tree/style.css'

const nodes = ref<TreeNode[]>([
  {
    key: '0',
    label: '根节点',
    children: [...]
  }
])

const selectedKeys = ref<TreeSelectionKeys>({})
const expandedKeys = ref<TreeExpandedKeys>({})
```

## 📖 API 文档

### Tree 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `value` | `TreeNode[]` | `[]` | 树形数据 |
| `modelValue` | `TreeSelectionKeys` | `null` | 选中的节点（v-model） |
| `selectionMode` | `'single' \| 'multiple' \| 'checkbox'` | `null` | 选择模式 |
| `selectionKeys` | `TreeSelectionKeys` | `{}` | 选中状态 |
| `expandedKeys` | `TreeExpandedKeys` | `{}` | 展开状态 |
| `dragdropScope` | `string` | `undefined` | 拖拽作用域 |
| `autoUpdate` | `boolean` | `false` | 拖拽时是否自动更新数据源 |
| `crossTreeAutoUpdate` | `boolean` | `false` | 跨树拖拽时是否自动更新数据源 |
| `filter` | `boolean` | `false` | 是否启用过滤 |
| `filterMode` | `'lenient' \| 'strict'` | `'lenient'` | 过滤模式 |
| `filterBy` | `string` | `'label'` | 过滤字段 |
| `lazy` | `boolean` | `false` | 是否懒加载 |
| `loading` | `boolean` | `false` | 加载状态 |
| `indent` | `number` | `1` | 缩进级别 |
| `metaKeySelection` | `boolean` | `true` | 是否支持 Ctrl/Cmd 多选 |

### Tree 组件事件

| 事件 | 参数 | 描述 |
|------|------|------|
| `node-select` | `TreeNodeSelectEvent` | 节点选中时触发 |
| `node-unselect` | `TreeNodeUnselectEvent` | 节点取消选中时触发 |
| `node-expand` | `TreeNodeExpandEvent` | 节点展开时触发 |
| `node-collapse` | `TreeNodeCollapseEvent` | 节点折叠时触发 |
| `node-focus` | `TreeNodeFocusEvent` | 节点获得焦点时触发 |
| `node-blur` | `TreeNodeBlurEvent` | 节点失去焦点时触发 |
| `node-click` | `TreeNodeClickEvent` | 节点点击时触发 |
| `node-drop` | `TreeNodeDropEvent` | 节点拖拽放置时触发 |
| `node-drag-start` | `{ originalEvent, node }` | 开始拖拽时触发 |
| `node-drag-end` | `{ originalEvent, node }` | 拖拽结束时触发 |
| `cross-tree-drag-start` | `CrossTreeDragStartEvent` | 跨树拖拽开始时触发 |
| `cross-tree-drag-enter` | `CrossTreeDragEnterEvent` | 拖拽节点进入目标树时触发 |
| `cross-tree-drag-over` | `CrossTreeDragOverEvent` | 拖拽节点在目标树上方移动时触发 |
| `cross-tree-drag-leave` | `CrossTreeDragLeaveEvent` | 拖拽节点离开目标树时触发 |
| `cross-tree-drop` | `CrossTreeDropEvent` | 跨树拖拽放置时触发 |
| `cross-tree-drag-end` | `CrossTreeDragEndEvent` | 跨树拖拽结束时触发（无论成功或失败） |
| `cross-tree-drag-cancel` | `CrossTreeDragCancelEvent` | 跨树拖拽取消时触发（如按 ESC 键） |

### TreeNode 接口

```typescript
interface TreeNode {
  key: string | number          // 节点唯一标识
  label: string                 // 节点显示文本
  data?: any                   // 节点关联数据
  icon?: string | Component    // 节点图标
  children?: TreeNode[]        // 子节点
  leaf?: boolean              // 是否为叶子节点
  expanded?: boolean          // 是否展开
  selectable?: boolean        // 是否可选择
  draggable?: boolean         // 是否可拖拽
  droppable?: boolean         // 是否可作为拖拽目标
  styleClass?: string         // 自定义样式类
  style?: Record<string, any> // 自定义样式
}
```

## 使用示例

### 1. 基础树形展示

```vue
<template>
  <Tree :value="basicData" />
</template>

<script setup>
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const basicData = [
  {
    key: '1',
    label: '文档',
    children: [
      { key: '1-1', label: '安装指南.md' },
      { key: '1-2', label: '快速开始.md' }
    ]
  }
]
</script>
```

### 2. 多选模式

```vue
<template>
  <Tree
    :value="data"
    v-model:selectionKeys="selectedKeys"
    selectionMode="multiple"
    :metaKeySelection="false"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const selectedKeys = ref({})
</script>
```

### 3. 复选框选择

```vue
<template>
  <Tree
    :value="data"
    v-model:selectionKeys="selectedKeys"
    selectionMode="checkbox"
  />
</template>

<script setup>
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'
</script>
```

### 4. 拖拽功能

#### 自动更新模式（推荐）

```vue
<template>
  <Tree
    :value="data"
    :autoUpdate="true"
    dragdropScope="demo"
    @node-drop="onNodeDrop"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const data = ref([...]) // 你的树形数据

const onNodeDrop = (event) => {
  // 自动更新模式下，数据会自动更新，只需要接受拖拽
  event.accept()
  console.log('拖拽完成，数据已自动更新')
}
</script>
```

#### 手动处理模式

```vue
<template>
  <Tree
    :value="data"
    :autoUpdate="false"
    dragdropScope="demo"
    @node-drop="onNodeDrop"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const data = ref([...]) // 你的树形数据

const onNodeDrop = (event) => {
  // 手动处理拖拽逻辑
  const { dragNode, dropNode, dropIndex } = event
  
  // 自定义拖拽处理逻辑
  if (dropNode) {
    // 拖拽到节点上
    if (!dropNode.children) dropNode.children = []
    dropNode.children.push(dragNode)
  } else {
    // 拖拽到根级别
    data.value.splice(dropIndex, 0, dragNode)
  }
  
  event.accept()
}
</script>
```

### 5. 跨树拖拽

#### 基础跨树拖拽

```vue
<template>
  <div class="flex gap-4">
    <Tree
      ref="sourceTree"
      :value="sourceData"
      dragdropScope="cross-tree"
      @node-drop="onCrossTreeDrop"
    />
    <Tree
      ref="targetTree"
      :value="targetData"
      dragdropScope="cross-tree"
      @node-drop="onCrossTreeDrop"
    />
  </div>
</template>

<script setup>
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const onCrossTreeDrop = (event) => {
  // 处理跨树拖拽
  if (event.isCrossTree) {
    // 跨树拖拽逻辑
    event.accept()
  }
}
</script>
```

#### 完整跨树拖拽事件监听

```vue
<template>
  <div class="flex gap-4">
    <Tree
      id="tree1"
      :value="sourceData"
      dragdropScope="cross-tree"
      @node-drop="onCrossTreeDrop"
      @cross-tree-drag-start="onCrossTreeDragStart"
      @cross-tree-drag-enter="onCrossTreeDragEnter"
      @cross-tree-drag-over="onCrossTreeDragOver"
      @cross-tree-drag-leave="onCrossTreeDragLeave"
      @cross-tree-drop="onCrossTreeDropEvent"
      @cross-tree-drag-end="onCrossTreeDragEnd"
      @cross-tree-drag-cancel="onCrossTreeDragCancel"
    />
    <Tree
      id="tree2"
      :value="targetData"
      dragdropScope="cross-tree"
      @node-drop="onCrossTreeDrop"
      @cross-tree-drag-start="onCrossTreeDragStart"
      @cross-tree-drag-enter="onCrossTreeDragEnter"
      @cross-tree-drag-over="onCrossTreeDragOver"
      @cross-tree-drag-leave="onCrossTreeDragLeave"
      @cross-tree-drop="onCrossTreeDropEvent"
      @cross-tree-drag-end="onCrossTreeDragEnd"
      @cross-tree-drag-cancel="onCrossTreeDragCancel"
    />
  </div>
</template>

<script setup>
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

// 跨树拖拽开始
const onCrossTreeDragStart = (event) => {
  console.log('跨树拖拽开始:', {
    sourceTreeId: event.sourceTreeId,
    dragNode: event.dragNode,
    isCrossTree: event.isCrossTree,
    timestamp: event.timestamp
  })
}

// 拖拽节点进入目标树
const onCrossTreeDragEnter = (event) => {
  console.log('进入目标树:', {
    sourceTreeId: event.sourceTreeId,
    targetTreeId: event.targetTreeId,
    dragNode: event.dragNode
  })
}

// 拖拽节点在目标树上方移动（频繁触发）
const onCrossTreeDragOver = (event) => {
  // 由于频繁触发，通常只做必要的处理
  console.log('在目标树上方移动')
}

// 拖拽节点离开目标树
const onCrossTreeDragLeave = (event) => {
  console.log('离开目标树:', {
    targetTreeId: event.targetTreeId,
    dragNode: event.dragNode
  })
}

// 跨树拖拽放置
const onCrossTreeDropEvent = (event) => {
  console.log('跨树拖拽放置:', {
    sourceTreeId: event.sourceTreeId,
    targetTreeId: event.targetTreeId,
    dragNode: event.dragNode,
    dropNode: event.dropNode,
    dropPosition: event.dropPosition
  })
}

// 跨树拖拽结束
const onCrossTreeDragEnd = (event) => {
  console.log('跨树拖拽结束:', {
    success: event.success,
    sourceTreeId: event.sourceTreeId,
    targetTreeId: event.targetTreeId
  })
}

// 跨树拖拽取消（如按 ESC 键）
const onCrossTreeDragCancel = (event) => {
  console.log('跨树拖拽取消:', {
    sourceTreeId: event.sourceTreeId,
    dragNode: event.dragNode
  })
}

// 传统的 node-drop 事件处理
const onCrossTreeDrop = (event) => {
  if (event.isCrossTree) {
    event.accept()
  }
}
</script>
```

#### 跨树拖拽自动更新

`crossTreeAutoUpdate` 参数控制跨树拖拽时是否自动更新数据源。v1.3.0 版本完善了跨树拖拽的数据同步机制，确保在两种模式下都能正确更新数据：

- **自动更新模式** (`crossTreeAutoUpdate: true`)：拖拽操作会自动调用 `accept()` 方法并同步更新源树和目标树的数据
- **手动确认模式** (`crossTreeAutoUpdate: false`)：需要手动调用 `accept()` 或 `reject()` 方法，确认后才会更新数据

```vue
<template>
  <div class="flex gap-4">
    <!-- 自动更新模式 -->
    <Tree
      id="auto-tree1"
      :value="autoData1"
      :crossTreeAutoUpdate="true"
      :dragdrop="true"
      dragdropScope="auto-cross-tree"
      @cross-tree-drop="onAutoUpdateDrop"
    />
    <Tree
      id="auto-tree2"
      :value="autoData2"
      :crossTreeAutoUpdate="true"
      :dragdrop="true"
      dragdropScope="auto-cross-tree"
      @cross-tree-drop="onAutoUpdateDrop"
    />
    
    <!-- 手动控制模式 -->
    <Tree
      id="manual-tree1"
      :value="manualData1"
      :crossTreeAutoUpdate="false"
      :dragdrop="true"
      dragdropScope="manual-cross-tree"
      @cross-tree-drop="onManualControlDrop"
    />
    <Tree
      id="manual-tree2"
      :value="manualData2"
      :crossTreeAutoUpdate="false"
      :dragdrop="true"
      dragdropScope="manual-cross-tree"
      @cross-tree-drop="onManualControlDrop"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const autoData1 = ref([...]) // 自动更新模式的源树数据
const autoData2 = ref([...]) // 自动更新模式的目标树数据
const manualData1 = ref([...]) // 手动控制模式的源树数据
const manualData2 = ref([...]) // 手动控制模式的目标树数据

// 自动更新模式：拖拽会自动完成数据同步
const onAutoUpdateDrop = (event) => {
  console.log('自动更新拖拽:', event)
  // v1.3.0 版本已完善数据同步机制，无需手动处理数据更新
  // 组件会自动调用 accept() 并更新源树和目标树的数据
}

// 手动控制模式：需要手动决定是否接受拖拽
const onManualControlDrop = (event) => {
  console.log('手动控制拖拽:', event)
  
  // 根据业务逻辑决定是否接受拖拽
  const shouldAccept = validateDragOperation(event)
  
  if (shouldAccept) {
    event.accept() // 接受拖拽，自动更新源树和目标树数据
  } else {
    event.reject() // 拒绝拖拽，不更新数据
  }
}

const validateDragOperation = (event) => {
  // 自定义验证逻辑
  return event.dragNode.label !== '禁止拖拽的节点'
}
</script>
```

**使用场景：**

- **自动更新模式** (`crossTreeAutoUpdate: true`)：适用于简单的拖拽操作，无需复杂验证
- **手动控制模式** (`crossTreeAutoUpdate: false`)：适用于需要验证、确认或异步处理的拖拽操作

**注意事项：**

1. `crossTreeAutoUpdate` 只影响跨树拖拽，不影响同树内的拖拽操作
2. 手动控制模式下，必须调用 `accept()` 或 `reject()` 方法，否则拖拽状态不会清理
3. 可以与 `autoUpdate` 参数配合使用，分别控制同树和跨树的拖拽行为

### 6. 节点过滤

```vue
<template>
  <Tree
    :value="data"
    :filter="true"
    filterBy="label"
    filterPlaceholder="搜索节点..."
  />
</template>

<script setup>
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'
</script>
```

### 7. 懒加载

```vue
<template>
  <Tree
    :value="data"
    :lazy="true"
    @node-load="onNodeLoad"
  />
</template>

<script setup>
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'

const onNodeLoad = async (event) => {
  // 异步加载子节点
  const children = await fetchChildren(event.node.key)
  event.node.children = children
}
</script>
```

## 键盘操作

| 按键 | 功能 |
|------|------|
| `↑/↓` | 上下导航 |
| `←/→` | 展开/折叠节点 |
| `Enter` | 选择节点 |
| `Space` | 切换复选框状态 |
| `Home` | 跳转到第一个节点 |
| `End` | 跳转到最后一个节点 |
| `Ctrl/Cmd + A` | 全选（多选模式） |

## 样式定制

### 导入样式

```javascript
// 导入默认样式
import 'vue3-super-tree/style.css'
```

### 原生焦点样式

组件使用浏览器原生的 `:focus` 伪类来管理焦点样式，提供更好的性能和无障碍访问体验：

```css
/* 组件内置的焦点样式 */
.tree-node:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
  background-color: #eff6ff;
}

/* 自定义焦点样式 */
.tree-node:focus {
  outline: 2px solid #10b981;
  background-color: #ecfdf5;
  border-radius: 0.375rem;
}
```

### 主题变量

组件支持通过 CSS 变量进行主题定制：

```css
:root {
  --tree-node-padding: 0.5rem;
  --tree-node-border-radius: 0.375rem;
  --tree-selected-bg: #3b82f6;
  --tree-selected-color: white;
  --tree-focus-bg: #eff6ff;
  --tree-focus-color: #1e40af;
  --tree-focus-outline: #3b82f6;
}
```

### 自定义样式类

```vue
<Tree
  :value="data"
  class="custom-tree"
  :selectedBackgroundColor="#10b981"
  :selectedTextColor="white"
  :focusBackgroundColor="#ecfdf5"
  :focusTextColor="#059669"
/>
```

## 相关链接

- **npm 包**: https://www.npmjs.com/package/vue3-super-tree
- **GitHub 仓库**: https://github.com/zuoanCo/vue3-super-tree
- **在线演示**: https://zuoanCo.github.io/vue3-super-tree
- **API 文档**: https://github.com/zuoanCo/vue3-super-tree#api-文档
- **问题反馈**: https://github.com/zuoanCo/vue3-super-tree/issues

## 技术栈

- **Vue 3.4+** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的前端构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide Icons** - 美观的图标库

## 性能优化

### 生产构建优化

组件在生产环境下自动进行以下优化：

- **调试日志移除** - 自动移除所有 `console.log` 调试信息
- **代码压缩** - 使用 Terser 进行代码压缩和混淆
- **Tree Shaking** - 移除未使用的代码，减小包体积
- **原生焦点管理** - 使用浏览器原生 `:focus` 伪类，减少 JavaScript 开销

### 运行时性能

- **虚拟滚动** - 大数据量时自动启用虚拟滚动
- **智能更新** - 只更新变化的节点，避免全量重渲染
- **内存优化** - 及时清理事件监听器和引用

## 项目结构

```
vue3-super-tree/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Tree.vue        # 主树组件
│   │   ├── TreeNode.vue    # 树节点组件
│   │   └── index.ts        # 组件导出
│   ├── lib/                # 核心库
│   │   ├── types.ts        # TypeScript 类型定义
│   │   ├── utils.ts        # 工具函数
│   │   ├── themes.ts       # 主题配置
│   │   └── index.ts        # 库导出
│   ├── composables/        # 组合式函数
│   │   ├── useDragDrop.ts  # 拖拽功能
│   │   ├── useSelection.ts # 选择功能
│   │   ├── useFilter.ts    # 过滤功能
│   │   └── index.ts        # 组合函数导出
│   └── style.css           # 样式文件
├── dist/                   # 构建输出
├── package.json           # 包配置
├── vite.lib.config.ts     # Vite 库构建配置
└── README.md              # 项目文档
```

## 🤝 贡献指南

欢迎贡献代码！vue3-super-tree 是一个开源 npm 包，我们欢迎社区的贡献。

### 开发环境设置

1. **克隆项目**
```bash
git clone https://github.com/zuoanCo/vue3-super-tree.git
cd vue3-super-tree
```

2. **安装依赖**
```bash
pnpm install
```

3. **启动开发服务器**
```bash
pnpm run dev
```

4. **构建库文件**
```bash
pnpm run build:lib
```

### 贡献流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 Vue 3 Composition API 最佳实践
- 添加适当的类型注解
- 编写清晰的注释
- 确保代码通过 ESLint 检查
- 添加相应的测试用例

### 代码规范

项目使用 ESLint 进行代码检查：

```bash
# 检查代码
pnpm run lint

# 自动修复
pnpm run lint:fix
```

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](https://github.com/zuoanCo/vue3-super-tree/blob/main/LICENSE) 文件了解详情。

## 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [PrimeVue](https://primevue.org/) - 功能参考来源
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Lucide](https://lucide.dev/) - 图标库
- [Vite](https://vitejs.dev/) - 构建工具

## 包信息

- **当前版本**: v1.3.1
- **包大小**: ~220KB (生产优化后)
- **支持的 Vue 版本**: 3.4+
- **TypeScript 支持**: 支持
- **Tree Shaking**: 支持
- **SSR 支持**: 支持
- **原生焦点管理**: 支持
- **自动拖拽更新**: 支持
- **跨树拖拽自动更新**: 支持

---

如果这个项目对你有帮助，请给它一个 ⭐️！

[![Star History Chart](https://api.star-history.com/svg?repos=zuoanCo/vue3-super-tree&type=Date)](https://star-history.com/#zuoanCo/vue3-super-tree&Date)