// Vue3 Super Tree - 主入口文件

import type { App } from 'vue'
import Tree from '../components/Tree.vue'
import TreeNode from '../components/TreeNode.vue'

// 导出组件
export { Tree, TreeNode }

// 导出组件索引和类型
export * from '../components/index'

// 导出类型 - 完整导出所有类型定义
export * from './types'
export type {
  TreeNode as TreeNodeType,
  TreeCheckboxSelectionKeys,
  TreeSelectionKeys,
  TreeExpandedKeys,
  TreeSelectionMode,
  TreeFilterMode,
  TreeDropPosition,
  TreeNodeSelectEvent,
  TreeNodeFocusEvent,
  TreeNodeBlurEvent,
  TreeNodeClickEvent,
  TreeNodeUnselectEvent,
  TreeNodeExpandEvent,
  TreeNodeCollapseEvent,
  TreeNodeDropEvent,
  TreeLazyLoadEvent,
  TreeState,
  DragDropState,
  TreeFilterConfig,
  TreeProps,
  TreeEmits,
  TreeNodePredicate,
  TreeNodeMapper,
  TreeNodeVisitor,
  SampleTreeData,
  KeyboardHandleResult,
  UseTreeStateReturn,
  UseDragDropReturn,
  UseFocusReturn,
  UseSelectionReturn,
  UseFilterReturn,
  UseThemeReturn
} from './types'

// 导出工具函数 - 完整导出所有工具函数
export * from './utils'
export {
  cn,
  findTreeNode,
  findTreeNodeWithParent,
  findTreeNodePath,
  traverseTree,
  mapTree,
  filterTree,
  insertTreeNode,
  removeTreeNode,
  updateTreeNode,
  moveTreeNode,
  isNodeSelected,
  isNodePartiallySelected,
  updateSelectionKeys,
  isNodeExpanded,
  updateExpandedKeys,
  expandAll,
  collapseAll,
  filterTreeNodes,
  canDropNode,
  getNodePosition,
  getNodeInfo,
  formatDragInfo,
  generateSampleData,
  getBasicSampleData,
  removeNodeFromTree,
  addNodeToTree,
  moveCrossTreeNode,
  canCrossTreeDrop,
  formatCrossTreeDragInfo,
  getCrossTreeSampleData
} from './utils'

// 导出 Composables - 完整导出所有组合式函数
export { useTreeState } from '../composables/useTreeState'
export { useDragDrop } from '../composables/useDragDrop'
export { useSelection } from '../composables/useSelection'
export { useFilter } from '../composables/useFilter'
export { useFocus } from '../composables/useFocus'
export { useTheme } from '../composables/useTheme'
export { useCrossTreeManager } from '../composables/useCrossTreeManager'

// 导出主题 - 完整导出所有主题相关的类和工具
export * from './themes'
export type {
  TreeTheme
} from './themes'
export {
  TreeThemeManager,
  laraLightTheme,
  laraDarkTheme,
  bootstrapTheme,
  materialTheme,
  fluentTheme,
  tailwindTheme,
  availableThemes,
  defaultThemeManager,
  themeUtils,
  useTreeTheme
} from './themes'

// 导出样式
import './tree.css'

// 插件配置接口
export interface TreePluginOptions {
  /**
   * 组件名称前缀
   * @default 'P'
   */
  prefix?: string
  
  /**
   * 是否全局注册组件
   * @default true
   */
  globalComponents?: boolean
  
  /**
   * 默认主题
   * @default 'lara-light'
   */
  defaultTheme?: string
  
  /**
   * 是否自动应用系统主题
   * @default false
   */
  autoSystemTheme?: boolean
  
  /**
   * 自定义样式
   */
  customStyles?: Record<string, string>
}

// 默认配置
const defaultOptions: TreePluginOptions = {
  prefix: 'P',
  globalComponents: true,
  defaultTheme: 'lara-light',
  autoSystemTheme: false,
  customStyles: {}
}

// Vue 插件
export const TreePlugin = {
  install(app: App, options: TreePluginOptions = {}) {
    const config = { ...defaultOptions, ...options }
    
    // 全局注册组件
    if (config.globalComponents) {
      app.component(`${config.prefix}Tree`, Tree)
      app.component(`${config.prefix}TreeNode`, TreeNode)
    }
    
    // 应用默认主题
    if (config.defaultTheme) {
      import('./themes').then(({ themeUtils }) => {
        if (config.autoSystemTheme) {
          themeUtils.applySystemTheme()
        } else {
          themeUtils.applyTheme(config.defaultTheme!)
        }
      })
    }
    
    // 应用自定义样式
    if (config.customStyles && Object.keys(config.customStyles).length > 0) {
      const root = document.documentElement
      Object.entries(config.customStyles).forEach(([property, value]) => {
        root.style.setProperty(property, value)
      })
    }
    
    // 提供全局配置
    app.provide('tree-plugin-config', config)
  }
}

// 默认导出插件
export default TreePlugin

// 便捷安装函数
export function createTreePlugin(options?: TreePluginOptions) {
  return {
    install(app: App) {
      TreePlugin.install(app, options)
    }
  }
}

// 版本信息
export const version = '1.0.0'

// 插件信息
export const pluginInfo = {
  name: 'Vue3 Super Tree',
  version,
  description: 'A powerful, highly customizable Vue 3 tree component with drag-and-drop, multi-selection, keyboard navigation and more',
  author: 'zuoanCo',
  license: 'MIT'
}

// 类型声明增强
declare module 'vue' {
  interface GlobalComponents {
    PTree: typeof Tree
    PTreeNode: typeof TreeNode
  }
}