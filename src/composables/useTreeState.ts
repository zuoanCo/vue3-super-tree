import { ref, computed, watch, type Ref } from 'vue'
import type { 
  TreeNode, 
  TreeSelectionKeys, 
  TreeExpandedKeys, 
  TreeSelectionMode,
  TreeState,
  UseTreeStateReturn
} from '../lib/types'
import { 
  isNodeSelected, 
  isNodePartiallySelected,
  updateSelectionKeys,
  isNodeExpanded,
  updateExpandedKeys,
  expandAll,
  collapseAll
} from '../lib/utils'

/**
 * 树状态管理 Composable
 * 管理选择状态、展开状态等核心状态
 */
export function useTreeState(
  nodes: Ref<TreeNode[]>,
  initialSelectionKeys?: TreeSelectionKeys,
  initialExpandedKeys?: TreeExpandedKeys,
  selectionMode: TreeSelectionMode = 'single'
): UseTreeStateReturn {
  // 响应式状态
  const selectionKeys = ref<TreeSelectionKeys>(initialSelectionKeys || null)
  const expandedKeys = ref<TreeExpandedKeys>(initialExpandedKeys || {})
  const loading = ref(false)

  // 计算属性
  const selectedNodes = computed(() => {
    if (!selectionKeys.value) return []
    
    if (Array.isArray(selectionKeys.value)) {
      return selectionKeys.value
    }
    
    if (typeof selectionKeys.value === 'object' && 'key' in selectionKeys.value) {
      return [selectionKeys.value]
    }
    
    if (typeof selectionKeys.value === 'object') {
      const selected: TreeNode[] = []
      const findSelectedNodes = (nodes: TreeNode[]) => {
        for (const node of nodes) {
          if (isNodeSelected(selectionKeys.value, node)) {
            selected.push(node)
          }
          if (node.children) {
            findSelectedNodes(node.children)
          }
        }
      }
      findSelectedNodes(nodes.value)
      return selected
    }
    
    return []
  })

  const expandedNodes = computed(() => {
    const expanded: TreeNode[] = []
    const findExpandedNodes = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (isNodeExpanded(expandedKeys.value, node)) {
          expanded.push(node)
        }
        if (node.children) {
          findExpandedNodes(node.children)
        }
      }
    }
    findExpandedNodes(nodes.value)
    return expanded
  })

  const hasSelection = computed(() => {
    return selectedNodes.value.length > 0
  })

  const hasExpanded = computed(() => {
    return Object.keys(expandedKeys.value).length > 0
  })

  // 状态管理方法
  const selectNode = (node: TreeNode, selected: boolean = true) => {
    if (node.selectable === false) return
    
    selectionKeys.value = updateSelectionKeys(
      selectionKeys.value,
      node,
      selected,
      selectionMode
    )
  }

  const toggleNodeSelection = (node: TreeNode) => {
    const isSelected = isNodeSelected(selectionKeys.value, node)
    selectNode(node, !isSelected)
  }

  const clearSelection = () => {
    switch (selectionMode) {
      case 'single':
        selectionKeys.value = null
        break
      case 'multiple':
        selectionKeys.value = []
        break
      case 'checkbox':
        selectionKeys.value = {}
        break
    }
  }

  const selectAll = () => {
    if (selectionMode === 'single') return
    
    const allNodes: TreeNode[] = []
    const collectNodes = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.selectable !== false) {
          allNodes.push(node)
        }
        if (node.children) {
          collectNodes(node.children)
        }
      }
    }
    collectNodes(nodes.value)

    if (selectionMode === 'multiple') {
      selectionKeys.value = allNodes
    } else if (selectionMode === 'checkbox') {
      const keys: Record<string, any> = {}
      allNodes.forEach(node => {
        keys[node.key] = { checked: true, partialChecked: false }
      })
      selectionKeys.value = keys
    }
  }

  const expandNode = (node: TreeNode, expanded: boolean = true) => {
    if (!node.children || node.children.length === 0) return
    
    expandedKeys.value = updateExpandedKeys(
      expandedKeys.value,
      node,
      expanded
    )
  }

  const toggleNodeExpansion = (node: TreeNode) => {
    const isExpanded = isNodeExpanded(expandedKeys.value, node)
    expandNode(node, !isExpanded)
  }

  const expandAllNodes = () => {
    expandedKeys.value = expandAll(nodes.value)
  }

  const collapseAllNodes = () => {
    expandedKeys.value = collapseAll()
  }

  // 节点状态检查方法
  const isSelected = (node: TreeNode) => {
    return isNodeSelected(selectionKeys.value, node)
  }

  const isPartiallySelected = (node: TreeNode) => {
    return isNodePartiallySelected(selectionKeys.value, node)
  }

  const isExpanded = (node: TreeNode) => {
    return isNodeExpanded(expandedKeys.value, node)
  }

  // 批量操作
  const setSelectionKeys = (keys: TreeSelectionKeys) => {
    selectionKeys.value = keys
  }

  const setExpandedKeys = (keys: TreeExpandedKeys) => {
    expandedKeys.value = keys
  }

  // 状态重置
  const resetState = () => {
    clearSelection()
    collapseAllNodes()
    loading.value = false
  }

  // 监听器
  watch(
    () => nodes.value,
    () => {
      // 当节点数据变化时，清理无效的状态
      if (selectionKeys.value && typeof selectionKeys.value === 'object') {
        // 清理不存在的选择状态
        // 这里可以添加更复杂的清理逻辑
      }
    },
    { deep: true }
  )

  // 返回状态和方法
  return {
    // 响应式状态
    selectionKeys,
    expandedKeys,
    loading,
    
    // 计算属性
    selectedNodes,
    expandedNodes,
    hasSelection,
    hasExpanded,
    
    // 选择相关方法
    selectNode,
    toggleNodeSelection,
    clearSelection,
    selectAll,
    setSelectionKeys,
    
    // 展开相关方法
    expandNode,
    toggleNodeExpansion,
    expandAllNodes,
    collapseAllNodes,
    setExpandedKeys,
    
    // 状态检查方法
    isSelected,
    isPartiallySelected,
    isExpanded,
    
    // 工具方法
    resetState
  }
}