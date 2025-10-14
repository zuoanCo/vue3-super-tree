import { ref, computed, watch, type Ref } from 'vue'
import type { 
  TreeNode, 
  TreeSelectionKeys, 
  TreeSelectionMode,
  TreeCheckboxSelectionKeys,
  TreeNodeSelectEvent,
  TreeNodeUnselectEvent
} from '../lib/types'
import { 
  isNodeSelected, 
  isNodePartiallySelected,
  updateSelectionKeys,
  findTreeNode,
  traverseTree
} from '../lib/utils'

/**
 * 选择功能 Composable
 * 专门处理树节点的选择逻辑，包括单选、多选、复选框模式
 */
export function useSelection(
  nodes: Ref<TreeNode[]>,
  selectionMode: Ref<TreeSelectionMode> = ref('single'),
  initialSelectionKeys?: TreeSelectionKeys
) {
  // 选择状态
  const selectionKeys = ref<TreeSelectionKeys>(initialSelectionKeys || null)

  // 计算属性
  const selectedNodes = computed(() => {
    if (!selectionKeys.value) return []
    
    const selected: TreeNode[] = []
    
    if (Array.isArray(selectionKeys.value)) {
      return selectionKeys.value
    }
    
    if (typeof selectionKeys.value === 'object' && 'key' in selectionKeys.value) {
      return [selectionKeys.value]
    }
    
    if (typeof selectionKeys.value === 'object') {
      traverseTree(nodes.value, (node) => {
        if (isNodeSelected(selectionKeys.value, node)) {
          selected.push(node)
        }
      })
    }
    
    return selected
  })

  const selectedCount = computed(() => selectedNodes.value.length)
  
  const hasSelection = computed(() => selectedCount.value > 0)

  const allSelected = computed(() => {
    if (selectionMode.value === 'single') return false
    
    let totalSelectableNodes = 0
    let selectedSelectableNodes = 0
    
    traverseTree(nodes.value, (node) => {
      // 只考虑叶子节点（文件），不考虑文件夹
      const isFolder = node.children && node.children.length > 0
      if (node.selectable !== false && !isFolder) {
        totalSelectableNodes++
        if (isNodeSelected(selectionKeys.value, node)) {
          selectedSelectableNodes++
        }
      }
    })
    
    return totalSelectableNodes > 0 && selectedSelectableNodes === totalSelectableNodes
  })

  const partiallySelected = computed(() => {
    if (selectionMode.value !== 'checkbox') return false
    
    let hasSelected = false
    let hasUnselected = false
    
    traverseTree(nodes.value, (node) => {
      // 只考虑叶子节点（文件），不考虑文件夹
      const isFolder = node.children && node.children.length > 0
      if (node.selectable !== false && !isFolder) {
        if (isNodeSelected(selectionKeys.value, node)) {
          hasSelected = true
        } else {
          hasUnselected = true
        }
      }
    })
    
    return hasSelected && hasUnselected
  })

  // 选择方法
  const selectNode = (node: TreeNode, selected: boolean = true, event?: Event) => {
    if (node.selectable === false) return
    
    // 检查是否为文件夹节点（有children的节点）
    const isFolder = node.children && node.children.length > 0
    if (isFolder) {
      // 文件夹节点不能被选中
      return null
    }
    
    const previousSelection = selectionKeys.value
    
    selectionKeys.value = updateSelectionKeys(
      selectionKeys.value,
      node,
      selected,
      selectionMode.value
    )

    // 触发事件
    if (selected && !isNodeSelected(previousSelection, node)) {
      const selectEvent: TreeNodeSelectEvent = {
        originalEvent: event || new Event('select'),
        node
      }
      return { type: 'select', event: selectEvent }
    } else if (!selected && isNodeSelected(previousSelection, node)) {
      const unselectEvent: TreeNodeUnselectEvent = {
        originalEvent: event || new Event('unselect'),
        node
      }
      return { type: 'unselect', event: unselectEvent }
    }
    
    return null
  }

  const toggleNodeSelection = (node: TreeNode, event?: Event) => {
    const isSelected = isNodeSelected(selectionKeys.value, node)
    return selectNode(node, !isSelected, event)
  }

  const selectMultipleNodes = (nodesToSelect: TreeNode[], event?: Event) => {
    if (selectionMode.value === 'single') {
      if (nodesToSelect.length > 0) {
        return selectNode(nodesToSelect[0], true, event)
      }
      return null
    }

    const events: Array<{ type: string; event: TreeNodeSelectEvent | TreeNodeUnselectEvent }> = []
    
    for (const node of nodesToSelect) {
      const result = selectNode(node, true, event)
      if (result) {
        events.push(result)
      }
    }
    
    return events
  }

  const clearSelection = () => {
    const previousSelection = selectionKeys.value
    
    switch (selectionMode.value) {
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

    // 返回取消选择的事件
    const events: TreeNodeUnselectEvent[] = []
    if (previousSelection) {
      const previouslySelected = selectedNodes.value
      for (const node of previouslySelected) {
        if (typeof node === 'object' && 'key' in node) {
          events.push({
            originalEvent: new Event('unselect'),
            node: node as TreeNode
          })
        }
      }
    }
    
    return events
  }

  const selectAll = () => {
    if (selectionMode.value === 'single') return []
    
    const allSelectableNodes: TreeNode[] = []
    traverseTree(nodes.value, (node) => {
      // 只选择叶子节点（文件），不选择文件夹
      const isFolder = node.children && node.children.length > 0
      if (node.selectable !== false && !isFolder) {
        allSelectableNodes.push(node)
      }
    })

    return selectMultipleNodes(allSelectableNodes)
  }

  // 复选框模式特有方法
  const updateCheckboxSelection = (node: TreeNode, checked: boolean, event?: Event) => {
    if (selectionMode.value !== 'checkbox') return null
    
    const keys = (selectionKeys.value as Record<string, TreeCheckboxSelectionKeys>) || {}
    
    // 更新当前节点
    keys[node.key] = { checked, partialChecked: false }
    
    // 更新子节点
    const updateChildren = (parentNode: TreeNode, parentChecked: boolean) => {
      if (parentNode.children) {
        for (const child of parentNode.children) {
          if (child.selectable !== false) {
            keys[child.key] = { checked: parentChecked, partialChecked: false }
          }
          updateChildren(child, parentChecked)
        }
      }
    }
    
    updateChildren(node, checked)
    
    // 更新父节点状态
    const updateParents = () => {
      traverseTree(nodes.value, (currentNode) => {
        if (currentNode.children && currentNode.children.length > 0) {
          let checkedChildren = 0
          let partialChildren = 0
          let totalChildren = 0
          
          for (const child of currentNode.children) {
            if (child.selectable !== false) {
              totalChildren++
              const childSelection = keys[child.key]
              if (childSelection?.checked) {
                checkedChildren++
              } else if (childSelection?.partialChecked) {
                partialChildren++
              }
            }
          }
          
          if (totalChildren > 0) {
            if (checkedChildren === totalChildren) {
              keys[currentNode.key] = { checked: true, partialChecked: false }
            } else if (checkedChildren > 0 || partialChildren > 0) {
              keys[currentNode.key] = { checked: false, partialChecked: true }
            } else {
              keys[currentNode.key] = { checked: false, partialChecked: false }
            }
          }
        }
      })
    }
    
    updateParents()
    selectionKeys.value = keys
    
    return selectNode(node, checked, event)
  }

  // 状态检查方法
  const isSelected = (node: TreeNode) => {
    return isNodeSelected(selectionKeys.value, node)
  }

  const isPartiallySelected = (node: TreeNode) => {
    return isNodePartiallySelected(selectionKeys.value, node)
  }

  const getSelectionState = (node: TreeNode) => {
    return {
      selected: isSelected(node),
      partiallySelected: isPartiallySelected(node)
    }
  }

  // 工具方法
  const setSelectionKeys = (keys: TreeSelectionKeys) => {
    selectionKeys.value = keys
  }

  const getSelectedNodeKeys = (): Array<string | number> => {
    return selectedNodes.value.filter(node => typeof node === 'object' && 'key' in node).map(node => (node as TreeNode).key)
  }

  const findSelectedNode = (key: string | number): TreeNode | null => {
    return selectedNodes.value.find(node => typeof node === 'object' && 'key' in node && (node as TreeNode).key === key) as TreeNode || null
  }

  // 监听选择模式变化
  watch(selectionMode, (newMode, oldMode) => {
    if (newMode !== oldMode) {
      // 模式切换时清空选择
      clearSelection()
    }
  })

  return {
    // 状态
    selectionKeys,
    selectedNodes,
    selectedCount,
    hasSelection,
    allSelected,
    partiallySelected,
    
    // 选择方法
    selectNode,
    toggleNodeSelection,
    selectMultipleNodes,
    clearSelection,
    selectAll,
    updateCheckboxSelection,
    
    // 状态检查
    isSelected,
    isPartiallySelected,
    getSelectionState,
    
    // 工具方法
    setSelectionKeys,
    getSelectedNodeKeys,
    findSelectedNode
  }
}