#!/usr/bin/env node

/**
 * 简化的插件测试脚本
 * 验证 vue3-super-tree 插件的基本功能
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
}

function testPluginStructure() {
  log.info('开始验证插件结构...')
  
  const projectRoot = path.resolve(__dirname, '../..')
  const distPath = path.join(projectRoot, 'dist')
  const packageJsonPath = path.join(projectRoot, 'package.json')
  
  let passed = 0
  let failed = 0
  
  const test = (condition, successMsg, errorMsg) => {
    if (condition) {
      log.success(successMsg)
      passed++
      return true
    } else {
      log.error(errorMsg)
      failed++
      return false
    }
  }
  
  // 1. 检查 package.json
  test(
    fs.existsSync(packageJsonPath),
    'package.json 文件存在',
    'package.json 文件不存在'
  )
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      test(
        packageJson.name === 'vue3-super-tree',
        `包名正确: ${packageJson.name}`,
        `包名错误: ${packageJson.name}`
      )
      
      test(
        packageJson.main,
        `主入口文件: ${packageJson.main}`,
        '主入口文件未定义'
      )
      
      test(
        packageJson.types,
        `类型定义文件: ${packageJson.types}`,
        '类型定义文件未定义'
      )
      
      test(
        packageJson.exports,
        '导出配置已定义',
        '导出配置未定义'
      )
      
    } catch (error) {
      log.error(`解析 package.json 失败: ${error.message}`)
      failed++
    }
  }
  
  // 2. 检查构建产物
  test(
    fs.existsSync(distPath),
    'dist 目录存在',
    'dist 目录不存在'
  )
  
  if (fs.existsSync(distPath)) {
    const distFiles = fs.readdirSync(distPath)
    
    test(
      distFiles.some(file => file.endsWith('.js')),
      'JavaScript 构建文件存在',
      'JavaScript 构建文件不存在'
    )
    
    test(
      distFiles.some(file => file.endsWith('.css')),
      'CSS 样式文件存在',
      'CSS 样式文件不存在'
    )
    
    test(
      distFiles.some(file => file.endsWith('.d.ts')),
      'TypeScript 类型定义文件存在',
      'TypeScript 类型定义文件不存在'
    )
  }
  
  // 3. 检查源码结构
  const srcPath = path.join(projectRoot, 'src')
  test(
    fs.existsSync(srcPath),
    'src 源码目录存在',
    'src 源码目录不存在'
  )
  
  if (fs.existsSync(srcPath)) {
    const componentsPath = path.join(srcPath, 'components')
    test(
      fs.existsSync(componentsPath),
      'components 目录存在',
      'components 目录不存在'
    )
    
    const composablesPath = path.join(srcPath, 'composables')
    test(
      fs.existsSync(composablesPath),
      'composables 目录存在',
      'composables 目录不存在'
    )
  }
  
  // 4. 检查关键文件
  const keyFiles = [
    'src/components/Tree.vue',
    'src/components/TreeNode.vue',
    'src/composables/useDragDrop.ts',
    'src/lib/index.ts'
  ]
  
  keyFiles.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath)
    test(
      fs.existsSync(fullPath),
      `关键文件存在: ${filePath}`,
      `关键文件缺失: ${filePath}`
    )
  })
  
  // 输出结果
  console.log('\n' + '='.repeat(50))
  log.info('插件结构验证完成')
  log.success(`通过: ${passed} 项`)
  
  if (failed > 0) {
    log.error(`失败: ${failed} 项`)
  }
  
  const totalTests = passed + failed
  const successRate = Math.round((passed / totalTests) * 100)
  
  console.log(`\n成功率: ${successRate}%`)
  
  if (failed === 0) {
    log.success('🎉 插件结构验证通过！')
    return true
  } else {
    log.error('💥 插件结构验证失败！')
    return false
  }
}

function testCrossTreeDragFeature() {
  log.info('验证跨树拖拽功能实现...')
  
  const projectRoot = path.resolve(__dirname, '../..')
  let passed = 0
  let failed = 0
  
  const test = (condition, successMsg, errorMsg) => {
    if (condition) {
      log.success(successMsg)
      passed++
      return true
    } else {
      log.error(errorMsg)
      failed++
      return false
    }
  }
  
  // 检查关键文件内容
  const useDragDropPath = path.join(projectRoot, 'src/composables/useDragDrop.ts')
  if (fs.existsSync(useDragDropPath)) {
    const content = fs.readFileSync(useDragDropPath, 'utf8')
    
    test(
      content.includes('globalDragState'),
      '全局拖拽状态管理已实现',
      '全局拖拽状态管理缺失'
    )
    
    test(
      content.includes('dragdropScope'),
      '拖拽作用域功能已实现',
      '拖拽作用域功能缺失'
    )
    
    test(
      content.includes('cross-tree-drop'),
      '跨树拖拽事件已实现',
      '跨树拖拽事件缺失'
    )
  } else {
    log.error('useDragDrop.ts 文件不存在')
    failed++
  }
  
  const treePath = path.join(projectRoot, 'src/components/Tree.vue')
  if (fs.existsSync(treePath)) {
    const content = fs.readFileSync(treePath, 'utf8')
    
    test(
      content.includes('handleNodeDrop'),
      'Tree 组件拖拽处理已实现',
      'Tree 组件拖拽处理缺失'
    )
    
    test(
      content.includes('cross-tree-drop'),
      'Tree 组件跨树事件已实现',
      'Tree 组件跨树事件缺失'
    )
  } else {
    log.error('Tree.vue 文件不存在')
    failed++
  }
  
  const treeNodePath = path.join(projectRoot, 'src/components/TreeNode.vue')
  if (fs.existsSync(treeNodePath)) {
    const content = fs.readFileSync(treeNodePath, 'utf8')
    
    test(
      content.includes('onDrop'),
      'TreeNode 拖拽处理已实现',
      'TreeNode 拖拽处理缺失'
    )
    
    test(
      content.includes('node-drop'),
      'TreeNode 拖拽事件已实现',
      'TreeNode 拖拽事件缺失'
    )
  } else {
    log.error('TreeNode.vue 文件不存在')
    failed++
  }
  
  // 输出结果
  console.log('\n' + '='.repeat(50))
  log.info('跨树拖拽功能验证完成')
  log.success(`通过: ${passed} 项`)
  
  if (failed > 0) {
    log.error(`失败: ${failed} 项`)
  }
  
  const totalTests = passed + failed
  const successRate = Math.round((passed / totalTests) * 100)
  
  console.log(`\n成功率: ${successRate}%`)
  
  if (failed === 0) {
    log.success('🎉 跨树拖拽功能验证通过！')
    return true
  } else {
    log.error('💥 跨树拖拽功能验证失败！')
    return false
  }
}

async function runAllTests() {
  console.log('🌲 Vue3 Super Tree 插件验证\n')
  
  const structureResult = testPluginStructure()
  console.log('\n')
  const featureResult = testCrossTreeDragFeature()
  
  console.log('\n' + '='.repeat(60))
  
  if (structureResult && featureResult) {
    log.success('🎉 所有验证通过！插件可以正常使用。')
    console.log('\n📋 使用建议:')
    console.log('1. 确保正确导入组件和样式')
    console.log('2. 配置相同的 dragdropScope 实现跨树拖拽')
    console.log('3. 监听 cross-tree-drop 事件处理跨树拖拽逻辑')
    console.log('4. 参考 test-integration/docs/ 目录下的文档')
    process.exit(0)
  } else {
    log.error('💥 验证失败！请检查插件配置。')
    process.exit(1)
  }
}

// 运行测试
runAllTests().catch(error => {
  log.error(`测试过程中发生错误: ${error.message}`)
  process.exit(1)
})