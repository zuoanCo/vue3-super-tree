// 测试基本类型导出
import type { 
  TreeNode,
  TreeSelectionMode,
  TreeFilterMode
} from './dist/src/lib/types'

import type { TreeTheme } from './dist/src/lib/themes'

// 测试类型是否正确
const testTreeNode: TreeNode = {
  key: 'test',
  label: 'Test Node',
  children: []
}

const testSelectionMode: TreeSelectionMode = 'single'
const testFilterMode: TreeFilterMode = 'lenient'

const testTreeTheme: TreeTheme = {
  name: 'test',
  variables: {}
}

console.log('✅ 基本类型测试通过！')
console.log('TreeNode:', testTreeNode)
console.log('TreeSelectionMode:', testSelectionMode)
console.log('TreeFilterMode:', testFilterMode)
console.log('TreeTheme:', testTreeTheme)