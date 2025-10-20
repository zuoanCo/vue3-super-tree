<template>
  <div class="simple-auto-update-demo">
    <h1>跨树自动更新功能演示</h1>
    
    <div class="controls">
      <label>
        <input 
          type="checkbox" 
          v-model="autoUpdateEnabled" 
        />
        启用跨树自动更新 (crossTreeAutoUpdate)
      </label>
    </div>

    <div class="demo-container">
      <div class="tree-section">
        <h3>📁 项目文件树</h3>
        <p class="tree-description">拖拽文件到右侧任务分类中</p>
        <Tree
          id="source-tree"
          v-model:value="sourceData"
          :dragdrop="true"
          dragdrop-scope="demo"
          :cross-tree-auto-update="autoUpdateEnabled"
          @cross-tree-drop="onCrossTreeDrop"
          class="demo-tree"
        />
      </div>

      <div class="tree-section">
        <h3>🎯 任务分类树</h3>
        <p class="tree-description">将文件分配到相应的任务类别</p>
        <Tree
          id="target-tree"
          v-model:value="targetData"
          :dragdrop="true"
          dragdrop-scope="demo"
          :cross-tree-auto-update="autoUpdateEnabled"
          @cross-tree-drop="onCrossTreeDrop"
          class="demo-tree"
        />
      </div>
    </div>

    <div class="logs">
      <h3>操作日志</h3>
      <div class="log-container">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          :class="['log-entry', `log-${log.type}`]"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <div class="instructions">
      <h3>使用说明</h3>
      <ul>
        <li>✅ <strong>启用自动更新</strong>：拖拽文件到任务分类会自动完成数据更新</li>
        <li>❌ <strong>禁用自动更新</strong>：拖拽操作不会自动完成，需要手动处理</li>
        <li>🔄 <strong>试试拖拽</strong>：将左侧的项目文件拖拽到右侧相应的任务分类中</li>
        <li>📁 <strong>文件示例</strong>：Vue组件 → 前端开发任务，测试文件 → 测试任务</li>
        <li>🔄 <strong>双向拖拽</strong>：也可以将任务拖拽回文件树中</li>
        <li>📝 <strong>操作日志</strong>：所有拖拽操作都会在下方日志中显示</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Tree from '@/components/Tree.vue'
import type { TreeNode, CrossTreeDropEvent } from '@/lib/types'
import { moveCrossTreeNode } from '@/lib/utils'

// 响应式数据
const autoUpdateEnabled = ref(true)

const sourceData = ref<TreeNode[]>([
  {
    key: 'source-1',
    label: '📁 项目文件',
    children: [
      {
        key: 'source-1-1',
        label: '📁 src',
        children: [
          { key: 'source-1-1-1', label: '📄 App.vue' },
          { key: 'source-1-1-2', label: '📄 main.ts' },
          {
            key: 'source-1-1-3',
            label: '📁 components',
            children: [
              { key: 'source-1-1-3-1', label: '🌳 Tree.vue' },
              { key: 'source-1-1-3-2', label: '🌿 TreeNode.vue' }
            ]
          },
          {
            key: 'source-1-1-4',
            label: '📁 pages',
            children: [
              { key: 'source-1-1-4-1', label: '🏠 HomePage.vue' },
              { key: 'source-1-1-4-2', label: '🎯 TreeDemo.vue' }
            ]
          }
        ]
      },
      {
        key: 'source-1-2',
        label: '📁 docs',
        children: [
          { key: 'source-1-2-1', label: '📖 README.md' },
          { key: 'source-1-2-2', label: '📋 API.md' },
          { key: 'source-1-2-3', label: '🎨 DESIGN.md' }
        ]
      },
      {
        key: 'source-1-3',
        label: '📁 tests',
        children: [
          { key: 'source-1-3-1', label: '🧪 unit.test.ts' },
          { key: 'source-1-3-2', label: '🔍 e2e.test.ts' }
        ]
      }
    ]
  },
  {
    key: 'source-2',
    label: '📁 配置文件',
    children: [
      { key: 'source-2-1', label: '⚙️ package.json' },
      { key: 'source-2-2', label: '🔧 vite.config.ts' },
      { key: 'source-2-3', label: '📝 tsconfig.json' },
      { key: 'source-2-4', label: '🎨 tailwind.config.js' }
    ]
  },
  {
    key: 'source-3',
    label: '📁 资源文件',
    children: [
      {
        key: 'source-3-1',
        label: '📁 images',
        children: [
          { key: 'source-3-1-1', label: '🖼️ logo.png' },
          { key: 'source-3-1-2', label: '🎨 banner.jpg' },
          { key: 'source-3-1-3', label: '🌟 icon.svg' }
        ]
      },
      {
        key: 'source-3-2',
        label: '📁 styles',
        children: [
          { key: 'source-3-2-1', label: '🎨 main.css' },
          { key: 'source-3-2-2', label: '🌈 theme.css' }
        ]
      }
    ]
  }
])

const targetData = ref<TreeNode[]>([
  {
    key: 'target-1',
    label: '🎯 前端开发任务',
    children: [
      {
        key: 'target-1-1',
        label: '🔧 组件开发',
        children: [
          { key: 'target-1-1-1', label: '✅ 完成 Tree 组件' },
          { key: 'target-1-1-2', label: '⏳ 优化 TreeNode 组件' }
        ]
      },
      {
        key: 'target-1-2',
        label: '🎨 UI/UX 设计',
        children: [
          { key: 'target-1-2-1', label: '📋 设计系统规范' },
          { key: 'target-1-2-2', label: '🎨 主题配色方案' }
        ]
      }
    ]
  },
  {
    key: 'target-2',
    label: '🔧 后端开发任务',
    children: [
      {
        key: 'target-2-1',
        label: '🗄️ 数据库设计',
        children: [
          { key: 'target-2-1-1', label: '📊 用户表结构' },
          { key: 'target-2-1-2', label: '🌳 树形数据表' }
        ]
      },
      {
        key: 'target-2-2',
        label: '🔌 API 开发',
        children: [
          { key: 'target-2-2-1', label: '🔐 用户认证接口' },
          { key: 'target-2-2-2', label: '🌳 树形数据接口' }
        ]
      }
    ]
  },
  {
    key: 'target-3',
    label: '🧪 测试任务',
    children: [
      { key: 'target-3-1', label: '🔍 单元测试' },
      { key: 'target-3-2', label: '🎭 集成测试' },
      { key: 'target-3-3', label: '🚀 端到端测试' }
    ]
  },
  {
    key: 'target-4',
    label: '📚 文档任务',
    children: [
      { key: 'target-4-1', label: '📖 用户手册' },
      { key: 'target-4-2', label: '🔧 开发文档' },
      { key: 'target-4-3', label: '🎯 API 文档' }
    ]
  }
])

const logs = ref<Array<{
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}>>([])

// 添加日志
const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
  logs.value.push({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
}

// 跨树拖拽事件处理
const onCrossTreeDrop = (event: CrossTreeDropEvent) => {
  addLog('info', `🔄 跨树拖拽: "${event.dragNode.label}" → "${event.dropNode.label}"`)
  addLog('info', `📍 拖拽位置: ${event.dropPosition}`)
  addLog('info', `⚙️ 自动更新状态: ${autoUpdateEnabled.value ? '启用' : '禁用'}`)
  addLog('info', `🌳 源树ID: ${event.sourceTreeId}, 目标树ID: ${event.targetTreeId}`)
  
  if (autoUpdateEnabled.value) {
    addLog('success', '✅ 自动更新已启用，开始处理数据更新')
    
    try {
      // 根据拖拽节点的 key 前缀判断源树
      const dragNodeKey = event.dragNode.key.toString()
      const isFromSource = dragNodeKey.startsWith('source-')
      
      if (isFromSource) {
        // 从源树拖拽到目标树
        addLog('info', '📂 从源树拖拽到目标树')
        addLog('debug', `拖拽节点: ${event.dragNode.key} (${event.dragNode.label})`)
        addLog('debug', `目标节点: ${event.dropNode.key} (${event.dropNode.label})`)
        addLog('debug', `拖拽位置: ${event.dropPosition}`)
        
        // 使用 moveCrossTreeNode 处理跨树数据移动
        const result = moveCrossTreeNode(
          sourceData.value,  // 源树数据（节点来自这里）
          targetData.value,  // 目标树数据（节点要去这里）
          event.dragNode.key,
          event.dropNode.key,
          event.dropPosition
        )
        
        if (result.success) {
          // 更新数据
          sourceData.value = result.sourceNodes  // 更新源树（移除了节点）
          targetData.value = result.targetNodes  // 更新目标树（添加了节点）
          
          addLog('success', '✅ 跨树数据更新成功')
          addLog('debug', `源树节点数: ${sourceData.value.length}`)
          addLog('debug', `目标树节点数: ${targetData.value.length}`)
          
          // 调用 accept 完成拖拽
          if (event.accept) {
            event.accept()
          }
        } else {
          addLog('error', '❌ 跨树数据更新失败')
          addLog('debug', '检查控制台以获取更多错误信息')
          
          // 调用 reject 取消拖拽
          if (event.reject) {
            event.reject()
          }
        }
      } else {
        // 从目标树拖拽到源树
        addLog('info', '📂 从目标树拖拽到源树')
        addLog('debug', `拖拽节点: ${event.dragNode.key} (${event.dragNode.label})`)
        addLog('debug', `目标节点: ${event.dropNode.key} (${event.dropNode.label})`)
        addLog('debug', `拖拽位置: ${event.dropPosition}`)
        
        // 使用 moveCrossTreeNode 处理跨树数据移动
        // 注意：从目标树拖拽到源树时，targetData 是源树，sourceData 是目标树
        const result = moveCrossTreeNode(
          targetData.value,  // 源树数据（节点来自这里）
          sourceData.value,  // 目标树数据（节点要去这里）
          event.dragNode.key,
          event.dropNode.key,
          event.dropPosition
        )
        
        if (result.success) {
          // 更新数据
          targetData.value = result.sourceNodes  // 更新源树（移除了节点）
          sourceData.value = result.targetNodes  // 更新目标树（添加了节点）
          
          addLog('success', '✅ 跨树数据更新成功')
          addLog('debug', `源树节点数: ${targetData.value.length}`)
          addLog('debug', `目标树节点数: ${sourceData.value.length}`)
          
          // 调用 accept 完成拖拽
          if (event.accept) {
            event.accept()
          }
        } else {
          addLog('error', '❌ 跨树数据更新失败')
          addLog('debug', '检查控制台以获取更多错误信息')
          
          // 调用 reject 取消拖拽
          if (event.reject) {
            event.reject()
          }
        }
      }
    } catch (error) {
      addLog('error', `❌ 跨树拖拽处理异常: ${error}`)
      
      // 调用 reject 取消拖拽
      if (event.reject) {
        event.reject()
      }
    }
  } else {
    addLog('warning', '⚠️ 自动更新已禁用，拖拽操作被取消')
    
    // 不调用 accept()，拖拽操作会被取消
    if (event.reject) {
      event.reject()
    }
  }
}

// 组件挂载
onMounted(() => {
  addLog('info', '🚀 项目文件到任务分类拖拽演示已加载')
  addLog('info', '📁 左侧：项目文件树 (包含源码、文档、配置等)')
  addLog('info', '🎯 右侧：任务分类树 (前端、后端、测试、文档)')
  addLog('info', '💡 试试将 Vue 组件拖拽到"前端开发任务"中')
  addLog('info', '🔧 可以切换自动更新开关来观察不同的行为')
})
</script>

<style scoped>
.simple-auto-update-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  cursor: pointer;
}

.demo-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.tree-section {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: white;
}

.tree-section h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.tree-description {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
  font-style: italic;
}

.demo-tree {
  min-height: 200px;
}

.logs {
  margin-bottom: 30px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
}

.log-entry {
  display: flex;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  font-family: monospace;
  font-size: 13px;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #666;
  margin-right: 12px;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.log-info .log-message {
  color: #2563eb;
}

.log-success .log-message {
  color: #16a34a;
  font-weight: 500;
}

.log-warning .log-message {
  color: #d97706;
  font-weight: 500;
}

.log-error .log-message {
  color: #dc2626;
  font-weight: 500;
}

.instructions {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
}

.instructions h3 {
  margin: 0 0 15px 0;
  color: #1e293b;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  line-height: 1.5;
}
</style>