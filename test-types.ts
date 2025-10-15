// 测试主要类型导出是否正常工作
import type { 
  TreeNode,
  TreeProps,
  TreeSelectionMode,
  TreeFilterMode,
  TreeTheme,
  TreePluginOptions
} from './dist/index'

// 测试类型是否正确
const testTreeNode: TreeNode = {
  key: 'test',
  label: 'Test Node',
  children: []
}

const testTreeProps: Partial<TreeProps> = {
  value: [testTreeNode],
  selectionMode: 'single',
  loading: false
}

const testTreeTheme: TreeTheme = {
  name: 'test',
  variables: {}
}

const testPluginOptions: TreePluginOptions = {
  prefix: 'P',
  globalComponents: true,
  defaultTheme: 'lara-light'
}

console.log('✅ 主要类型测试通过！')
console.log('TreeNode:', testTreeNode)
console.log('TreeProps:', testTreeProps)
console.log('TreeTheme:', testTreeTheme)
console.log('TreePluginOptions:', testPluginOptions)