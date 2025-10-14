# Vue Tree 组件

一个功能强大、高度可定制的 Vue 3 树形组件，完全复刻 PrimeVue Tree 的功能特性，支持拖拽、多选、键盘导航等高级功能。

## 特性

### 基础功能
- **树形数据展示** - 支持无限层级的树形结构
- **节点展开/折叠** - 可控制的节点展开状态
- **多种选择模式** - 单选、多选、复选框三种选择模式
- **双向绑定** - 完整的 v-model 支持
- **自定义图标** - 支持节点图标、展开/折叠图标自定义

### 高级功能
- **拖拽排序** - 同树内节点拖拽重排
- **跨树拖拽** - 支持在不同树组件间拖拽节点
- **键盘导航** - 完整的键盘操作支持（方向键、Enter、Space等）
- **节点过滤** - 实时搜索和过滤节点
- **懒加载** - 支持动态加载子节点
- **焦点管理** - 完善的焦点状态管理
- **自定义样式** - 支持主题定制和样式覆盖

### 技术特性
- **Vue 3 + Composition API** - 现代化的 Vue 3 开发体验
- **TypeScript** - 完整的类型定义和类型安全
- **Tailwind CSS** - 现代化的样式系统
- **响应式设计** - 适配各种屏幕尺寸
- **事件钩子系统** - 丰富的事件回调支持
- **无障碍访问** - 完整的 ARIA 支持

## 技术栈

- **Vue 3.4+** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的前端构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide Icons** - 美观的图标库
- **Vue Router** - Vue.js 官方路由管理器

## 安装

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

## 快速开始

### 开发环境

```bash
# 启动开发服务器
pnpm run dev

# 类型检查
pnpm run check

# 代码检查
pnpm run lint

# 自动修复代码风格
pnpm run lint:fix
```

### 基础使用

```vue
<template>
  <Tree
    :value="treeData"
    v-model:selectionKeys="selectedKeys"
    v-model:expandedKeys="expandedKeys"
    selectionMode="single"
    @node-select="onNodeSelect"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Tree from '@/components/Tree.vue'
import type { TreeNode, TreeSelectionKeys, TreeExpandedKeys } from '@/lib/types'

const treeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '根节点',
    children: [
      { key: '1-1', label: '子节点 1' },
      { key: '1-2', label: '子节点 2' }
    ]
  }
])

const selectedKeys = ref<TreeSelectionKeys>({})
const expandedKeys = ref<TreeExpandedKeys>({})

const onNodeSelect = (event) => {
  console.log('选中节点:', event.node)
}
</script>
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
| `node-drag-from` | `{ originalEvent, node, sourceTreeId }` | 跨树拖拽源树事件 |
| `node-drag-to` | `{ originalEvent, node, targetTreeId }` | 跨树拖拽目标树事件 |

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
```

### 4. 拖拽功能

```vue
<template>
  <Tree
    :value="data"
    dragdropScope="demo"
    @node-drop="onNodeDrop"
  />
</template>

<script setup>
const onNodeDrop = (event) => {
  // 处理拖拽逻辑
  event.accept()
}
</script>
```

### 5. 跨树拖拽

```vue
<template>
  <div class="flex gap-4">
    <Tree
      ref="sourceTree"
      :value="sourceData"
      dragdropScope="cross-tree"
      @node-drop="onCrossTreeDrop"
      @node-drag-from="onSourceDragFrom"
    />
    <Tree
      ref="targetTree"
      :value="targetData"
      dragdropScope="cross-tree"
      @node-drop="onCrossTreeDrop"
      @node-drag-to="onTargetDragTo"
    />
  </div>
</template>

<script setup>
const onCrossTreeDrop = (event) => {
  // 处理跨树拖拽
  if (event.isCrossTree) {
    // 跨树拖拽逻辑
    event.accept()
  }
}
</script>
```

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

## 项目结构

```
tree/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Tree.vue        # 主树组件
│   │   ├── TreeNode.vue    # 树节点组件
│   │   └── Empty.vue       # 空状态组件
│   ├── lib/                # 核心库
│   │   └── types.ts        # TypeScript 类型定义
│   ├── composables/        # 组合式函数
│   ├── hooks/              # 自定义钩子
│   ├── pages/              # 页面组件
│   │   ├── HomePage.vue    # 首页
│   │   └── TreeDemo.vue    # 演示页面
│   └── router/             # 路由配置
├── public/                 # 静态资源
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind 配置
└── tsconfig.json          # TypeScript 配置
```

## 开发指南

### 本地开发

1. 克隆项目
```bash
git clone <repository-url>
cd tree
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm run dev
```

4. 访问演示页面
```
http://localhost:5173/demo
```

### 构建生产版本

```bash
pnpm run build
```

### 代码规范

项目使用 ESLint 进行代码检查：

```bash
# 检查代码
pnpm run lint

# 自动修复
pnpm run lint:fix
```

## 样式定制

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

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

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

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [PrimeVue](https://primevue.org/) - 功能参考来源
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Lucide](https://lucide.dev/) - 图标库

---

如果这个项目对你有帮助，请给它一个 ⭐️！