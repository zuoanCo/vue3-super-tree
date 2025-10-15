import { computed, nextTick, type Ref } from 'vue'
import type { TreeNode, KeyboardHandleResult } from '../lib/types'
import { traverseTree } from '../lib/utils'

/**
 * 简化的焦点管理 Composable
 * 只处理键盘导航，焦点样式完全依赖浏览器原生 :focus 伪类
 */
export function useFocus(nodes: Ref<TreeNode[]>) {
  // 计算属性 - 只获取可聚焦的叶子节点（文件）
  const focusableNodes = computed(() => {
    const focusable: TreeNode[] = []
    traverseTree(nodes.value, (node) => {
      // 只有叶子节点（文件）才能被聚焦
      if (node.selectable !== false && (!node.children || node.children.length === 0)) {
        focusable.push(node)
      }
    })
    return focusable
  })

  // DOM 操作辅助函数
  const getCurrentFocusedElement = (): HTMLElement | null => {
    return document.activeElement as HTMLElement
  }

  const getCurrentFocusedNodeKey = (): string | number | null => {
    const activeElement = getCurrentFocusedElement()
    if (activeElement) {
      // 从 DOM 元素获取节点 key
      const nodeKey = activeElement.closest('[data-node-key]')?.getAttribute('data-node-key')
      return nodeKey || null
    }
    return null
  }

  const getCurrentFocusIndex = (): number => {
    const currentKey = getCurrentFocusedNodeKey()
    if (!currentKey) return -1
    return focusableNodes.value.findIndex(node => String(node.key) === currentKey)
  }

  const focusElementByNodeKey = async (nodeKey: string | number) => {
    await nextTick()
    const element = document.querySelector(`[data-node-key="${nodeKey}"]`) as HTMLElement
    if (element) {
      element.focus()
    }
  }

  // 键盘导航方法 - 直接操作 DOM 焦点
  const focusNext = (event?: Event) => {
    const currentIndex = getCurrentFocusIndex()
    const focusableList = focusableNodes.value
    
    if (focusableList.length === 0) return null
    
    let nextIndex = currentIndex + 1
    if (nextIndex >= focusableList.length) {
      nextIndex = 0 // 循环到第一个
    }
    
    const nextNode = focusableList[nextIndex]
    focusElementByNodeKey(nextNode.key)
    return nextNode
  }

  const focusPrevious = (event?: Event) => {
    const currentIndex = getCurrentFocusIndex()
    const focusableList = focusableNodes.value
    
    if (focusableList.length === 0) return null
    
    let prevIndex = currentIndex - 1
    if (prevIndex < 0) {
      prevIndex = focusableList.length - 1 // 循环到最后一个
    }
    
    const prevNode = focusableList[prevIndex]
    focusElementByNodeKey(prevNode.key)
    return prevNode
  }

  const focusFirst = (event?: Event) => {
    const focusableList = focusableNodes.value
    if (focusableList.length > 0) {
      const firstNode = focusableList[0]
      focusElementByNodeKey(firstNode.key)
      return firstNode
    }
    return null
  }

  const focusLast = (event?: Event) => {
    const focusableList = focusableNodes.value
    if (focusableList.length > 0) {
      const lastNode = focusableList[focusableList.length - 1]
      focusElementByNodeKey(lastNode.key)
      return lastNode
    }
    return null
  }

  // 键盘事件处理
  const handleKeyDown = (event: KeyboardEvent): KeyboardHandleResult => {
    const currentKey = getCurrentFocusedNodeKey()
    if (!currentKey) return null

    const currentNode = focusableNodes.value.find(node => String(node.key) === currentKey)
    if (!currentNode) return null

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusNext(event)
        return { type: 'navigate', event }
      
      case 'ArrowUp':
        event.preventDefault()
        focusPrevious(event)
        return { type: 'navigate', event }
      
      case 'Home':
        event.preventDefault()
        focusFirst(event)
        return { type: 'navigate', event }
      
      case 'End':
        event.preventDefault()
        focusLast(event)
        return { type: 'navigate', event }
      
      case 'Enter':
      case ' ':
        event.preventDefault()
        // 返回当前焦点节点，让父组件处理选择逻辑
        return {
          type: 'activate',
          node: currentNode,
          event
        }
      
      default:
        return null
    }
  }

  return {
    // 计算属性
    focusableNodes,
    
    // 键盘导航
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    handleKeyDown,
    
    // DOM 操作
    focusElementByNodeKey,
    getCurrentFocusedElement,
    getCurrentFocusedNodeKey
  }
}