<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题和说明 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">跨树拖拽演示</h1>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 class="text-lg font-semibold text-blue-800 mb-2">使用说明</h2>
          <ul class="text-blue-700 space-y-1">
            <li>• 您可以在左右两个树之间拖拽节点</li>
            <li>• 支持从左树拖拽到右树，也支持从右树拖拽到左树</li>
            <li>• 开启自动更新后，拖拽会自动更新数据</li>
            <li>• 关闭自动更新后，需要手动确认拖拽操作</li>
            <li>• 所有操作都会在下方的日志中显示</li>
          </ul>
        </div>
      </div>

      <!-- 控制面板 -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="autoUpdateEnabled"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700">启用自动更新</span>
            </label>
            <span class="text-sm text-gray-500">
              当前状态: {{ autoUpdateEnabled ? '自动更新' : '手动确认' }}
            </span>
          </div>
          <button
            @click="clearLogs"
            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border text-gray-600"
          >
            清空日志
          </button>
        </div>
      </div>

      <!-- 树组件容器 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 左侧树 -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4 border-b bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-800">项目文件树</h3>
            <p class="text-sm text-gray-600 mt-1">包含项目文件和文件夹</p>
          </div>
          <div class="p-4">
            <Tree
              :value="leftTreeData"
              :dragdrop="true"
              dragdrop-scope="cross-tree-demo"
              :cross-tree-auto-update="autoUpdateEnabled"
              @cross-tree-drop="onCrossTreeDrop"
              @cross-tree-drag-start="onCrossTreeDragStart"
              @cross-tree-drag-end="onCrossTreeDragEnd"
              class="min-h-[300px]"
            />
          </div>
        </div>

        <!-- 右侧树 -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4 border-b bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-800">任务分类树</h3>
            <p class="text-sm text-gray-600 mt-1">包含任务分类和具体任务</p>
          </div>
          <div class="p-4">
            <Tree
              :value="rightTreeData"
              :dragdrop="true"
              dragdrop-scope="cross-tree-demo"
              :cross-tree-auto-update="autoUpdateEnabled"
              @cross-tree-drop="onCrossTreeDrop"
              @cross-tree-drag-start="onCrossTreeDragStart"
              @cross-tree-drag-end="onCrossTreeDragEnd"
              class="min-h-[300px]"
            />
          </div>
        </div>
      </div>

      <!-- 拖拽状态显示 -->
      <div v-if="dragState.isDragging" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <span class="text-yellow-800 font-medium">正在拖拽中...</span>
        </div>
        <div class="mt-2 text-sm text-yellow-700">
          <p>源树: {{ dragState.sourceTree }}</p>
          <p>拖拽节点: {{ dragState.draggedNodes?.map(n => n.label).join(', ') }}</p>
        </div>
      </div>

      <!-- 操作日志 -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="p-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-800">操作日志</h3>
          <p class="text-sm text-gray-600 mt-1">实时显示拖拽操作和结果</p>
        </div>
        <div class="p-4">
          <div v-if="logs.length === 0" class="text-gray-500 text-center py-8">
            暂无操作日志
          </div>
          <div v-else class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="(log, index) in logs.slice().reverse()"
              :key="index"
              class="flex items-start space-x-3 p-3 rounded border"
              :class="{
                'bg-green-50 border-green-200': log.type === 'success',
                'bg-red-50 border-red-200': log.type === 'error',
                'bg-blue-50 border-blue-200': log.type === 'info',
                'bg-yellow-50 border-yellow-200': log.type === 'warning'
              }"
            >
              <div class="flex-shrink-0 mt-0.5">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-green-400': log.type === 'success',
                    'bg-red-400': log.type === 'error',
                    'bg-blue-400': log.type === 'info',
                    'bg-yellow-400': log.type === 'warning'
                  }"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium" :class="{
                  'text-green-800': log.type === 'success',
                  'text-red-800': log.type === 'error',
                  'text-blue-800': log.type === 'info',
                  'text-yellow-800': log.type === 'warning'
                }">
                  {{ log.message }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ log.timestamp }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Tree from '../components/Tree.vue'
import { moveCrossTreeNode } from '../lib/utils'
import type { TreeNode, CrossTreeDropEvent } from '../lib/types'

// 自动更新开关
const autoUpdateEnabled = ref(true)

// 拖拽状态
const dragState = reactive({
  isDragging: false,
  sourceTree: '',
  draggedNodes: null as TreeNode[] | null
})

// 操作日志
const logs = ref<Array<{
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timestamp: string
}>>([])

// 左侧树数据 - 项目文件树
const leftTreeData = ref<TreeNode[]>([
  {
    key: 'src',
    label: 'src',
    children: [
      {
        key: 'components',
        label: 'components',
        children: [
          { key: 'Tree.vue', label: 'Tree.vue' },
          { key: 'TreeNode.vue', label: 'TreeNode.vue' }
        ]
      },
      {
        key: 'pages',
        label: 'pages',
        children: [
          { key: 'Home.vue', label: 'Home.vue' },
          { key: 'Demo.vue', label: 'Demo.vue' }
        ]
      },
      { key: 'main.ts', label: 'main.ts' },
      { key: 'App.vue', label: 'App.vue' }
    ]
  },
  {
    key: 'public',
    label: 'public',
    children: [
      { key: 'index.html', label: 'index.html' },
      { key: 'favicon.ico', label: 'favicon.ico' }
    ]
  },
  { key: 'package.json', label: 'package.json' },
  { key: 'README.md', label: 'README.md' }
])

// 右侧树数据 - 任务分类树
const rightTreeData = ref<TreeNode[]>([
  {
    key: 'frontend',
    label: '前端开发',
    children: [
      {
        key: 'ui-tasks',
        label: 'UI任务',
        children: [
          { key: 'design-header', label: '设计页头' },
          { key: 'create-sidebar', label: '创建侧边栏' }
        ]
      },
      {
        key: 'feature-tasks',
        label: '功能任务',
        children: [
          { key: 'add-search', label: '添加搜索功能' },
          { key: 'implement-filter', label: '实现过滤器' }
        ]
      }
    ]
  },
  {
    key: 'backend',
    label: '后端开发',
    children: [
      { key: 'api-design', label: 'API设计' },
      { key: 'database-schema', label: '数据库设计' }
    ]
  },
  {
    key: 'testing',
    label: '测试',
    children: [
      { key: 'unit-tests', label: '单元测试' },
      { key: 'integration-tests', label: '集成测试' }
    ]
  }
])

// 添加日志
const addLog = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
  logs.value.push({
    type,
    message,
    timestamp: new Date().toLocaleTimeString()
  })
}

// 清空日志
const clearLogs = () => {
  logs.value = []
  addLog('info', '日志已清空')
}

// 跨树拖拽开始事件
const onCrossTreeDragStart = (event: any) => {
  dragState.isDragging = true
  dragState.sourceTree = event.sourceTreeId
  dragState.draggedNodes = event.draggedNodes
  
  addLog('info', `开始跨树拖拽: 从 ${event.sourceTreeId} 拖拽 ${event.draggedNodes.length} 个节点`)
}

// 跨树拖拽结束事件
const onCrossTreeDragEnd = (event: any) => {
  dragState.isDragging = false
  dragState.sourceTree = ''
  dragState.draggedNodes = null
  
  addLog('info', '跨树拖拽结束')
}

// 跨树拖拽放置事件
const onCrossTreeDrop = (event: CrossTreeDropEvent) => {
  const { sourceTreeId, targetTreeId, dragNode, dropNode, dropPosition } = event
  
  addLog('info', `跨树拖拽: 从 ${sourceTreeId} 到 ${targetTreeId}`)
  
  try {
    // 确定源数据和目标数据
    let sourceTreeNodes: TreeNode[]
    let targetTreeNodes: TreeNode[]
    
    if (sourceTreeId === 'tree-0') {
      sourceTreeNodes = leftTreeData.value
      targetTreeNodes = rightTreeData.value
    } else {
      sourceTreeNodes = rightTreeData.value
      targetTreeNodes = leftTreeData.value
    }
    
    // 执行跨树移动
    const result = moveCrossTreeNode(
      sourceTreeNodes,
      targetTreeNodes,
      dragNode.key,
      dropNode.key,
      dropPosition
    )
    
    if (result.success) {
      // 更新数据
      if (sourceTreeId === 'tree-0') {
        leftTreeData.value = result.sourceNodes
        rightTreeData.value = result.targetNodes
      } else {
        rightTreeData.value = result.sourceNodes
        leftTreeData.value = result.targetNodes
      }
      
      event.accept()
      addLog('success', `成功移动节点: ${dragNode.label}`)
    } else {
      event.reject()
      addLog('error', '跨树移动失败: 无法完成节点移动操作')
    }
  } catch (error) {
    event.reject()
    addLog('error', `跨树移动出错: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 初始化日志
addLog('info', '跨树拖拽演示页面已加载')
</script>