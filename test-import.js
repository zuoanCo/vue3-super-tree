// 测试 vue3-super-tree 包的模块结构
import fs from 'fs'

console.log('🔍 检查库文件结构...')

// 检查主要文件是否存在
const files = [
  './dist/index.d.ts',
  './dist/index.es.js', 
  './dist/index.umd.js',
  './dist/style.css',
  './dist/src/components/index.d.ts',
  './dist/src/lib/types.d.ts',
  './dist/src/composables/index.d.ts'
]

let allFilesExist = true

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`)
  } else {
    console.log(`❌ ${file} - 不存在`)
    allFilesExist = false
  }
})

if (allFilesExist) {
  console.log('\n🎉 所有必需的库文件都已生成！')
  console.log('📦 现在您可以使用以下方式导入组件：')
  console.log('import { Tree, TreeNode } from "vue3-super-tree"')
  console.log('import "vue3-super-tree/style.css"')
} else {
  console.log('\n❌ 某些文件缺失，请重新构建库')
}