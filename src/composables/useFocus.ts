import { ref, computed, nextTick, type Ref } from 'vue'
import type { TreeNode, TreeNodeFocusEvent, TreeNodeBlurEvent, KeyboardHandleResult } from '../lib/types'
import { findTreeNode, traverseTree } from '../lib/utils'

/**
 * 焦点管理 Composable
 * 专门处理树节点的焦点状态和键盘导航
 */
export function useFocus(nodes: Ref<TreeNode[]>) {
  // 焦点状态
  const focusedNode = ref<TreeNode | null>(null)
  const focusedNodeKey = ref<string | number | null>(null)

  // 计算属性
  const hasFocus = computed(() => focusedNode.value !== null)
  
  const focusableNodes = computed(() => {
    const focusable: TreeNode[] = []
    traverseTree(nodes.value, (node) => {
      if (node.selectable !== false) {
        focusable.push(node)
      }
    })
    return focusable
  })

  const currentFocusIndex = computed(() => {
    if (!focusedNode.value) return -1
    return focusableNodes.value.findIndex(node => node.key === focusedNode.value?.key)
  })

  // 焦点方法
  const focusNode = (node: TreeNode | null, event?: Event) => {
    const previousNode = focusedNode.value
    
    // 如果是同一个节点，不需要处理
    if (previousNode?.key === node?.key) return null
    
    // 失去焦点事件
    let blurEvent: TreeNodeBlurEvent | null = null
    if (previousNode) {
      blurEvent = {
        originalEvent: event || new Event('blur'),
        node: previousNode
      }
    }
    
    // 设置新焦点
    focusedNode.value = node
    focusedNodeKey.value = node?.key || null
    
    // 获得焦点事件
    let focusEvent: TreeNodeFocusEvent | null = null
    if (node) {
      focusEvent = {
        originalEvent: event || new Event('focus'),
        node
      }
    }
    
    return {
      blurEvent,
      focusEvent
    }
  }

  const clearFocus = (event?: Event) => {
    return focusNode(null, event)
  }

  const focusNodeByKey = (key: string | number, event?: Event) => {
    const node = findTreeNode(nodes.value, key)
    if (node) {
      return focusNode(node, event)
    }
    return null
  }

  const isFocused = (node: TreeNode) => {
    return focusedNode.value?.key === node.key
  }

  // 键盘导航方法
  const focusNext = (event?: Event) => {
    const currentIndex = currentFocusIndex.value
    const focusableList = focusableNodes.value
    
    if (focusableList.length === 0) return null
    
    let nextIndex = currentIndex + 1
    if (nextIndex >= focusableList.length) {
      nextIndex = 0 // 循环到第一个
    }
    
    return focusNode(focusableList[nextIndex], event)
  }

  const focusPrevious = (event?: Event) => {
    const currentIndex = currentFocusIndex.value
    const focusableList = focusableNodes.value
    
    if (focusableList.length === 0) return null
    
    let prevIndex = currentIndex - 1
    if (prevIndex < 0) {
      prevIndex = focusableList.length - 1 // 循环到最后一个
    }
    
    return focusNode(focusableList[prevIndex], event)
  }

  const focusFirst = (event?: Event) => {
    const focusableList = focusableNodes.value
    if (focusableList.length > 0) {
      return focusNode(focusableList[0], event)
    }
    return null
  }

  const focusLast = (event?: Event) => {
    const focusableList = focusableNodes.value
    if (focusableList.length > 0) {
      return focusNode(focusableList[focusableList.length - 1], event)
    }
    return null
  }

  // 键盘事件处理
  const handleKeyDown = (event: KeyboardEvent): KeyboardHandleResult => {
    if (!focusedNode.value) return null

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        return focusNext(event)
      
      case 'ArrowUp':
        event.preventDefault()
        return focusPrevious(event)
      
      case 'Home':
        event.preventDefault()
        return focusFirst(event)
      
      case 'End':
        event.preventDefault()
        return focusLast(event)
      
      case 'Enter':
      case ' ':
        event.preventDefault()
        // 返回当前焦点节点，让父组件处理选择逻辑
        return {
          type: 'activate',
          node: focusedNode.value,
          event
        }
      
      case 'Escape':
        event.preventDefault()
        return clearFocus(event)
      
      default:
        return null
    }
  }

  // DOM 焦点管理
  const focusElement = async (element: HTMLElement | null) => {
    if (element) {
      await nextTick()
      element.focus()
    }
  }

  const scrollIntoView = async (element: HTMLElement | null) => {
    if (element) {
      await nextTick()
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }

  return {
    // 状态
    focusedNode,
    focusedNodeKey,
    hasFocus,
    focusableNodes,
    currentFocusIndex,
    
    // 焦点方法
    focusNode,
    clearFocus,
    focusNodeByKey,
    isFocused,
    
    // 键盘导航
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    handleKeyDown,
    
    // DOM 操作
    focusElement,
    scrollIntoView
  }
}