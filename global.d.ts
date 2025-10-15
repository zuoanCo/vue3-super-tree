// Vue3 Super Tree - 全局类型声明文件

import type { DefineComponent } from 'vue'
import type { TreeProps, TreeEmits } from './src/lib/types'
import type { TreeNodeProps, TreeNodeEmits } from './src/components/TreeNode.vue'

// 声明 Vue 组件模块
declare module '*.vue' {
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明 Tree 组件
declare module 'vue3-super-tree' {
  export const Tree: DefineComponent<TreeProps, TreeEmits>
  export const TreeNode: DefineComponent<TreeNodeProps, TreeNodeEmits>
  
  // 导出所有类型
  export * from './src/lib/types'
  export * from './src/lib/utils'
  export * from './src/lib/themes'
  
  // 导出所有 composables
  export * from './src/composables/useTreeState'
  export * from './src/composables/useDragDrop'
  export * from './src/composables/useSelection'
  export * from './src/composables/useFilter'
  export * from './src/composables/useFocus'
  export * from './src/composables/useTheme'
  
  // 导出插件
  export { TreePlugin, createTreePlugin } from './src/lib/index'
}

// Vue 全局组件类型增强
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    /**
     * Vue3 Super Tree 组件
     */
    PTree: DefineComponent<TreeProps, TreeEmits>
    
    /**
     * Vue3 Super Tree 节点组件
     */
    PTreeNode: DefineComponent<TreeNodeProps, TreeNodeEmits>
    
    /**
     * Vue3 Super Tree 组件 (别名)
     */
    Tree: DefineComponent<TreeProps, TreeEmits>
    
    /**
     * Vue3 Super Tree 节点组件 (别名)
     */
    TreeNode: DefineComponent<TreeNodeProps, TreeNodeEmits>
  }
}

// 扩展 Vue 实例类型
declare module 'vue' {
  interface ComponentCustomProperties {
    /**
     * Vue3 Super Tree 全局配置
     */
    $treeConfig?: {
      prefix?: string
      globalComponents?: boolean
      defaultTheme?: string
      autoSystemTheme?: boolean
      customStyles?: Record<string, string>
    }
  }
}

// CSS 模块声明
declare module '*.css' {
  const content: string
  export default content
}

// 样式文件声明
declare module 'vue3-super-tree/dist/style.css'

// 环境变量类型增强
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      VUE_APP_TREE_DEBUG?: string
    }
  }
}

export