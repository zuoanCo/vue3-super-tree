#!/usr/bin/env node

/**
 * 构建产物验证脚本
 * 验证 npm 包的完整性和可用性
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

// 验证结果
const results = {
  passed: 0,
  failed: 0,
  warnings: 0
}

// 验证函数
const validate = (condition, successMsg, errorMsg) => {
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

const warn = (condition, warningMsg) => {
  if (!condition) {
    log.warning(warningMsg)
    results.warnings++
  }
}

async function validateBuild() {
  log.info('开始验证构建产物...')
  
  const rootDir = path.resolve(__dirname, '../..')
  const distDir = path.join(rootDir, 'dist')
  const packageJsonPath = path.join(rootDir, 'package.json')
  
  // 1. 验证 package.json 存在
  validate(
    fs.existsSync(packageJsonPath),
    'package.json 文件存在',
    'package.json 文件不存在'
  )
  
  // 2. 读取 package.json
  let packageJson
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    log.success('package.json 解析成功')
    results.passed++
  } catch (error) {
    log.error(`package.json 解析失败: ${error.message}`)
    results.failed++
    return
  }
  
  // 3. 验证基本字段
  validate(
    packageJson.name === 'vue3-super-tree',
    '包名正确: vue3-super-tree',
    `包名错误: ${packageJson.name}`
  )
  
  validate(
    packageJson.version && /^\d+\.\d+\.\d+/.test(packageJson.version),
    `版本号格式正确: ${packageJson.version}`,
    `版本号格式错误: ${packageJson.version}`
  )
  
  validate(
    packageJson.main,
    `主入口文件已定义: ${packageJson.main}`,
    '主入口文件未定义'
  )
  
  validate(
    packageJson.module,
    `ES模块入口已定义: ${packageJson.module}`,
    'ES模块入口未定义'
  )
  
  validate(
    packageJson.types,
    `TypeScript类型定义已定义: ${packageJson.types}`,
    'TypeScript类型定义未定义'
  )
  
  // 4. 验证构建目录
  validate(
    fs.existsSync(distDir),
    'dist 目录存在',
    'dist 目录不存在'
  )
  
  if (fs.existsSync(distDir)) {
    const distFiles = fs.readdirSync(distDir)
    log.info(`dist 目录包含 ${distFiles.length} 个文件`)
    
    // 验证关键文件
    const requiredFiles = [
      'vue3-super-tree.js',
      'vue3-super-tree.umd.cjs',
      'vue3-super-tree.d.ts',
      'style.css'
    ]
    
    requiredFiles.forEach(file => {
      validate(
        distFiles.includes(file),
        `关键文件存在: ${file}`,
        `关键文件缺失: ${file}`
      )
    })
    
    // 验证文件大小
    requiredFiles.forEach(file => {
      const filePath = path.join(distDir, file)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        const sizeKB = Math.round(stats.size / 1024)
        
        if (file.endsWith('.js') || file.endsWith('.cjs')) {
          warn(
            sizeKB < 500,
            `${file} 文件较大 (${sizeKB}KB)，可能影响加载性能`
          )
        }
        
        validate(
          stats.size > 0,
          `${file} 文件大小正常 (${sizeKB}KB)`,
          `${file} 文件为空`
        )
      }
    })
  }
  
  // 5. 验证类型定义文件
  const typesFile = path.join(distDir, 'vue3-super-tree.d.ts')
  if (fs.existsSync(typesFile)) {
    const typesContent = fs.readFileSync(typesFile, 'utf8')
    
    validate(
      typesContent.includes('export'),
      '类型定义文件包含导出声明',
      '类型定义文件缺少导出声明'
    )
    
    validate(
      typesContent.includes('TreeNode'),
      '类型定义文件包含 TreeNode 类型',
      '类型定义文件缺少 TreeNode 类型'
    )
    
    validate(
      typesContent.includes('Tree'),
      '类型定义文件包含 Tree 组件',
      '类型定义文件缺少 Tree 组件'
    )
  }
  
  // 6. 验证样式文件
  const styleFile = path.join(distDir, 'style.css')
  if (fs.existsSync(styleFile)) {
    const styleContent = fs.readFileSync(styleFile, 'utf8')
    const sizeKB = Math.round(styleContent.length / 1024)
    
    validate(
      styleContent.includes('.tree'),
      '样式文件包含树组件样式',
      '样式文件缺少树组件样式'
    )
    
    warn(
      sizeKB < 100,
      `样式文件较大 (${sizeKB}KB)，可能影响加载性能`
    )
  }
  
  // 7. 验证依赖关系
  if (packageJson.peerDependencies) {
    validate(
      packageJson.peerDependencies.vue,
      `Vue 依赖已定义: ${packageJson.peerDependencies.vue}`,
      'Vue 依赖未定义'
    )
  }
  
  // 8. 验证文件结构
  const expectedStructure = [
    'src/',
    'dist/',
    'package.json',
    'README.md',
    'LICENSE'
  ]
  
  expectedStructure.forEach(item => {
    const itemPath = path.join(rootDir, item)
    validate(
      fs.existsSync(itemPath),
      `项目结构完整: ${item}`,
      `项目结构缺失: ${item}`
    )
  })
  
  // 输出总结
  console.log('\n' + '='.repeat(50))
  log.info('验证完成')
  log.success(`通过: ${results.passed} 项`)
  
  if (results.failed > 0) {
    log.error(`失败: ${results.failed} 项`)
  }
  
  if (results.warnings > 0) {
    log.warning(`警告: ${results.warnings} 项`)
  }
  
  const totalTests = results.passed + results.failed
  const successRate = Math.round((results.passed / totalTests) * 100)
  
  console.log(`\n成功率: ${successRate}%`)
  
  if (results.failed === 0) {
    log.success('🎉 所有验证通过！构建产物可以安全发布。')
    process.exit(0)
  } else {
    log.error('💥 验证失败！请修复问题后重新构建。')
    process.exit(1)
  }
}

// 运行验证
validateBuild().catch(error => {
  log.error(`验证过程中发生错误: ${error.message}`)
  process.exit(1)
})