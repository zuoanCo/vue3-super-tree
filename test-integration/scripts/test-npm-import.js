#!/usr/bin/env node

/**
 * npm 包导入测试脚本
 * 测试从 npm 安装和导入 vue3-super-tree 包
 */

import { execSync } from 'child_process'
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

// 测试结果
const results = {
  passed: 0,
  failed: 0
}

const test = (condition, successMsg, errorMsg) => {
  if (condition) {
    log.success(successMsg)
    results.passed++
    return true
  } else {
    log.error(errorMsg)
    results.failed++
    return false
  }
}

async function testNpmImport() {
  log.info('开始测试 npm 包导入...')
  
  const testDir = path.join(__dirname, '../temp-test-project')
  
  try {
    // 1. 创建临时测试项目
    log.info('创建临时测试项目...')
    
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
    
    fs.mkdirSync(testDir, { recursive: true })
    
    // 2. 初始化 package.json
    const packageJson = {
      name: 'vue3-super-tree-import-test',
      version: '1.0.0',
      type: 'module',
      dependencies: {
        vue: '^3.4.0'
      }
    }
    
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )
    
    log.success('临时项目创建成功')
    
    // 3. 安装 vue3-super-tree
    log.info('安装 vue3-super-tree...')
    
    try {
      execSync('npm install vue3-super-tree@latest', {
        cwd: testDir,
        stdio: 'pipe'
      })
      log.success('vue3-super-tree 安装成功')
      results.passed++
    } catch (error) {
      log.error(`vue3-super-tree 安装失败: ${error.message}`)
      results.failed++
      return
    }
    
    // 4. 测试 ES 模块导入
    log.info('测试 ES 模块导入...')
    
    const esTestCode = `
import { Tree } from 'vue3-super-tree'
import 'vue3-super-tree/dist/style.css'

console.log('ES 模块导入成功')
console.log('Tree 组件:', typeof Tree)

if (typeof Tree === 'object' && Tree.name) {
  console.log('Tree 组件名称:', Tree.name)
  console.log('✅ ES 模块导入测试通过')
} else {
  console.log('❌ Tree 组件导入异常')
  process.exit(1)
}
`
    
    fs.writeFileSync(path.join(testDir, 'test-es-import.js'), esTestCode)
    
    try {
      const output = execSync('node test-es-import.js', {
        cwd: testDir,
        encoding: 'utf8'
      })
      
      test(
        output.includes('ES 模块导入测试通过'),
        'ES 模块导入测试通过',
        'ES 模块导入测试失败'
      )
    } catch (error) {
      log.error(`ES 模块导入测试失败: ${error.message}`)
      results.failed++
    }
    
    // 5. 测试 TypeScript 类型
    log.info('测试 TypeScript 类型...')
    
    const tsTestCode = `
import type { TreeNode, TreeNodeSelectEvent } from 'vue3-super-tree'

// 测试类型定义
const testNode: TreeNode = {
  key: 'test',
  label: 'Test Node'
}

const testEvent: TreeNodeSelectEvent = {
  originalEvent: new Event('click'),
  node: testNode
}

console.log('TypeScript 类型测试通过')
console.log('TreeNode 类型:', typeof testNode)
console.log('TreeNodeSelectEvent 类型:', typeof testEvent)
console.log('✅ TypeScript 类型导入测试通过')
`
    
    fs.writeFileSync(path.join(testDir, 'test-types.ts'), tsTestCode)
    
    // 安装 TypeScript
    try {
      execSync('npm install typescript @types/node', {
        cwd: testDir,
        stdio: 'pipe'
      })
      
      // 创建 tsconfig.json
      const tsConfig = {
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'node',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        }
      }
      
      fs.writeFileSync(
        path.join(testDir, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
      )
      
      // 编译 TypeScript
      execSync('npx tsc test-types.ts --noEmit', {
        cwd: testDir,
        stdio: 'pipe'
      })
      
      log.success('TypeScript 类型检查通过')
      results.passed++
    } catch (error) {
      log.error(`TypeScript 类型检查失败: ${error.message}`)
      results.failed++
    }
    
    // 6. 测试样式文件
    log.info('测试样式文件...')
    
    const styleFile = path.join(testDir, 'node_modules/vue3-super-tree/dist/style.css')
    
    test(
      fs.existsSync(styleFile),
      '样式文件存在',
      '样式文件不存在'
    )
    
    if (fs.existsSync(styleFile)) {
      const styleContent = fs.readFileSync(styleFile, 'utf8')
      
      test(
        styleContent.includes('.tree'),
        '样式文件包含树组件样式',
        '样式文件缺少树组件样式'
      )
      
      test(
        styleContent.length > 0,
        `样式文件大小正常 (${Math.round(styleContent.length / 1024)}KB)`,
        '样式文件为空'
      )
    }
    
    // 7. 测试包信息
    log.info('验证包信息...')
    
    const installedPackageJson = JSON.parse(
      fs.readFileSync(path.join(testDir, 'node_modules/vue3-super-tree/package.json'), 'utf8')
    )
    
    test(
      installedPackageJson.name === 'vue3-super-tree',
      `包名正确: ${installedPackageJson.name}`,
      `包名错误: ${installedPackageJson.name}`
    )
    
    test(
      installedPackageJson.version,
      `版本号: ${installedPackageJson.version}`,
      '版本号缺失'
    )
    
    test(
      installedPackageJson.main,
      `主入口: ${installedPackageJson.main}`,
      '主入口缺失'
    )
    
    test(
      installedPackageJson.types,
      `类型定义: ${installedPackageJson.types}`,
      '类型定义缺失'
    )
    
  } catch (error) {
    log.error(`测试过程中发生错误: ${error.message}`)
    results.failed++
  } finally {
    // 清理临时目录
    if (fs.existsSync(testDir)) {
      try {
        fs.rmSync(testDir, { recursive: true, force: true })
        log.info('临时测试项目已清理')
      } catch (error) {
        log.warning(`清理临时目录失败: ${error.message}`)
      }
    }
  }
  
  // 输出结果
  console.log('\n' + '='.repeat(50))
  log.info('npm 包导入测试完成')
  log.success(`通过: ${results.passed} 项`)
  
  if (results.failed > 0) {
    log.error(`失败: ${results.failed} 项`)
  }
  
  const totalTests = results.passed + results.failed
  const successRate = Math.round((results.passed / totalTests) * 100)
  
  console.log(`\n成功率: ${successRate}%`)
  
  if (results.failed === 0) {
    log.success('🎉 所有导入测试通过！npm 包可以正常使用。')
    process.exit(0)
  } else {
    log.error('💥 导入测试失败！请检查包的发布配置。')
    process.exit(1)
  }
}

// 运行测试
testNpmImport().catch(error => {
  log.error(`测试过程中发生错误: ${error.message}`)
  process.exit(1)
})