# 外部项目使用 Vue3 Super Tree 示例

## 📁 项目结构示例

```
my-project/
├── package.json
├── vite.config.ts (或 webpack.config.js)
├── src/
│   ├── main.ts
│   ├── App.vue
│   └── components/
│       └── TreeExample.vue
```

## 📦 package.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "vue": "^3.3.0",
    "vue3-super-tree": "^1.4.2"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.0.0",
    "vite": "^4.0.0"
  }
}
```

## ⚙️ vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  css: {
    // 确保 CSS 正确处理
    preprocessorOptions: {}
  }
})
```

## 🚀 main.ts

```typescript
import { createApp } from 'vue'
import App from './App.vue'

// 方式一：全局注册（推荐）
import { TreePlugin } from 'vue3-super-tree'
import 'vue3-super-tree/style.css'  // 关键！必须导入样式

const app = createApp(App)
app.use(TreePlugin)
app.mount('#app')
```

## 📄 App.vue

```vue
<template>
  <div id="app">
    <h1>Vue3 Super Tree 示例</h1>
    <TreeExample />
  </div>
</template>

<script setup lang="ts">
import TreeExample from './components/TreeExample.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding: 20px;
}
</style>
```

## 🌳 components/TreeExample.vue

```vue
<template>
  <div class="tree-example">
    <h2>拖拽树示例</h2>
    
    <!-- 调试信息 -->
    <div class="debug-panel">
      <h3>调试信息</h3>
      <p>拖拽启用: {{ dragdrop }}</p>
      <p>作用域: {{ dragdropScope }}</p>
      <p>节点数量: {{ treeData.length }}</p>
      <p>CSS 加载状态: {{ cssLoaded ? '✅ 已加载' : '❌ 未加载' }}</p>
    </div>
    
    <!-- 单树拖拽 -->
    <div class="tree-container">
      <h3>单树内拖拽</h3>
      <Tree 
        :value="treeData"
        :dragdrop="dragdrop"
        :dragdrop-scope="dragdropScope"
        selection-mode="single"
        @update:value="treeData = $event"
        @node-drag-start="onDragStart"
        @node-drop="onDrop"
      />
    </div>
    
    <!-- 跨树拖拽 -->
    <div class="cross-tree-container">
      <h3>跨树拖拽</h3>
      <div class="trees-row">
        <div class="tree-column">
          <h4>树 A</h4>
          <Tree 
            id="treeA"
            :value="treeDataA"
            :dragdrop="true"
            dragdrop-scope="cross-tree-demo"
            cross-tree-group="demo-group"
            selection-mode="single"
            @update:value="treeDataA = $event"
            @cross-tree-move="onCrossTreeMove"
          />
        </div>
        
        <div class="tree-column">
          <h4>树 B</h4>
          <Tree 
            id="treeB"
            :value="treeDataB"
            :dragdrop="true"
            dragdrop-scope="cross-tree-demo"
            cross-tree-group="demo-group"
            selection-mode="single"
            @update:value="treeDataB = $event"
            @cross-tree-move="onCrossTreeMove"
          />
        </div>
      </div>
    </div>
    
    <!-- 事件日志 -->
    <div class="events-log">
      <h3>事件日志</h3>
      <div class="events">
        <div v-for="event in events" :key="event.id" class="event-item">
          <span class="event-time">{{ event.time }}</span>
          <span class="event-message">{{ event.message }}</span>
        </div>
      </div>
      <button @click="clearEvents">清空日志</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Tree } from 'vue3-super-tree'
import type { TreeNode } from 'vue3-super-tree'

// 如果没有全局注册，需要导入样式
// import 'vue3-super-tree/style.css'

// 单树数据
const treeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '📁 文档',
    children: [
      { key: '1-1', label: '📄 文档1.txt' },
      { key: '1-2', label: '📄 文档2.txt' },
      {
        key: '1-3',
        label: '📁 子文件夹',
        children: [
          { key: '1-3-1', label: '📄 子文档.txt' }
        ]
      }
    ]
  },
  {
    key: '2',
    label: '📁 图片',
    children: [
      { key: '2-1', label: '🖼️ 图片1.jpg' },
      { key: '2-2', label: '🖼️ 图片2.png' }
    ]
  },
  { key: '3', label: '📄 根文件.txt' }
])

// 跨树数据
const treeDataA = ref<TreeNode[]>([
  {
    key: 'a1',
    label: '🔵 节点 A1',
    children: [
      { key: 'a1-1', label: '🔵 子节点 A1-1' },
      { key: 'a1-2', label: '🔵 子节点 A1-2' }
    ]
  },
  { key: 'a2', label: '🔵 节点 A2' }
])

const treeDataB = ref<TreeNode[]>([
  {
    key: 'b1',
    label: '🔴 节点 B1',
    children: [
      { key: 'b1-1', label: '🔴 子节点 B1-1' }
    ]
  },
  { key: 'b2', label: '🔴 节点 B2' }
])

// 配置
const dragdrop = ref(true)
const dragdropScope = ref('demo-scope')

// 事件日志
const events = ref<Array<{id: number, time: string, message: string}>>([])
let eventId = 0

const addEvent = (message: string) => {
  events.value.unshift({
    id: eventId++,
    time: new Date().toLocaleTimeString(),
    message
  })
  // 保持最新的 10 条记录
  if (events.value.length > 10) {
    events.value = events.value.slice(0, 10)
  }
}

const clearEvents = () => {
  events.value = []
}

// 检查 CSS 是否加载
const cssLoaded = computed(() => {
  if (typeof document === 'undefined') return false
  
  // 检查是否有相关的样式表
  const hasStylesheet = Array.from(document.styleSheets).some(sheet => {
    try {
      return Array.from(sheet.cssRules || []).some(rule => 
        rule.cssText && rule.cssText.includes('.p-tree')
      )
    } catch {
      return false
    }
  })
  
  // 检查是否有相关的 style 标签
  const hasStyleTag = Array.from(document.querySelectorAll('style')).some(style =>
    style.textContent && style.textContent.includes('.p-tree')
  )
  
  return hasStylesheet || hasStyleTag
})

// 事件处理器
const onDragStart = (event: any) => {
  addEvent(`🚀 开始拖拽: ${event.node.label}`)
}

const onDrop = (event: any) => {
  addEvent(`📍 放置节点: ${event.dragNode?.label} -> ${event.dropNode?.label || '根级'}`)
}

const onCrossTreeMove = (event: any) => {
  const sourceTree = event.sourceTreeId
  const targetTree = event.targetTreeId
  const nodeName = event.dragNode?.label
  addEvent(`🔄 跨树移动: ${nodeName} 从 ${sourceTree} 移动到 ${targetTree}`)
}

// 生命周期
onMounted(() => {
  addEvent('✅ 组件已挂载')
  
  // 延迟检查 DOM 和样式
  setTimeout(() => {
    const nodeElements = document.querySelectorAll('.p-tree-node-content')
    addEvent(`🔍 找到 ${nodeElements.length} 个树节点元素`)
    
    if (nodeElements.length > 0) {
      const firstNode = nodeElements[0] as HTMLElement
      const draggable = firstNode.getAttribute('draggable')
      addEvent(`🎯 第一个节点 draggable 属性: ${draggable}`)
    }
    
    if (cssLoaded.value) {
      addEvent('🎨 CSS 样式已正确加载')
    } else {
      addEvent('⚠️ CSS 样式未加载 - 这可能导致拖拽功能不工作')
    }
  }, 1000)
})
</script>

<style scoped>
.tree-example {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.debug-panel {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.debug-panel h3 {
  margin-top: 0;
  color: #495057;
}

.debug-panel p {
  margin: 8px 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.tree-container {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.cross-tree-container {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.trees-row {
  display: flex;
  gap: 20px;
}

.tree-column {
  flex: 1;
  min-height: 200px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 15px;
}

.tree-column h4 {
  margin-top: 0;
  text-align: center;
  color: #6c757d;
}

.events-log {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
}

.events {
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.event-item {
  display: flex;
  margin-bottom: 5px;
  font-size: 14px;
}

.event-time {
  color: #6c757d;
  font-family: 'Courier New', monospace;
  margin-right: 10px;
  min-width: 80px;
}

.event-message {
  color: #495057;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>
```

## 🔧 常见问题解决

### 问题 1: 拖拽不工作

**检查清单**:
- ✅ 是否导入了 `'vue3-super-tree/style.css'`
- ✅ 是否设置了 `:dragdrop="true"`
- ✅ 是否设置了 `dragdrop-scope`
- ✅ 节点数据是否包含 `key` 和 `label`

### 问题 2: 跨树拖拽不工作

**检查清单**:
- ✅ 两个树是否有相同的 `dragdrop-scope`
- ✅ 两个树是否有相同的 `cross-tree-group`
- ✅ 是否监听了 `@cross-tree-move` 事件

### 问题 3: TypeScript 类型错误

```typescript
// 确保正确导入类型
import type { TreeNode } from 'vue3-super-tree'

// 如果仍有问题，可以在 env.d.ts 中添加：
declare module 'vue3-super-tree' {
  import { DefineComponent } from 'vue'
  export const Tree: DefineComponent<any, any, any>
  export interface TreeNode {
    key: string
    label: string
    children?: TreeNode[]
    [key: string]: any
  }
}
```

## 🚀 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📞 获取帮助

如果按照此示例仍然无法正常工作：

1. 检查浏览器控制台是否有错误
2. 确认 Vue 版本兼容性（需要 Vue 3.0+）
3. 查看 [故障排除指南](./TROUBLESHOOTING.md)
4. 提交 [GitHub Issue](https://github.com/zuoanCo/vue3-super-tree/issues)

---

**重要提醒**: 90% 的问题都是因为忘记导入 CSS 样式文件！