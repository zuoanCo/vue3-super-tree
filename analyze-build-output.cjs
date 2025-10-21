// 分析构建输出中的 useCrossTreeManager 声明
const fs = require('fs');
const path = require('path');

console.log('=== 分析 useCrossTreeManager 构建声明 ===\n');

// 检查源文件
const sourceFile = path.join(__dirname, 'src/composables/useCrossTreeManager.ts');
if (fs.existsSync(sourceFile)) {
  const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
  const sourceExports = sourceContent.match(/export.*useCrossTreeManager/g) || [];
  console.log('1. 源文件 (useCrossTreeManager.ts):');
  console.log(`   导出数量: ${sourceExports.length}`);
  sourceExports.forEach((exp, i) => {
    console.log(`   ${i + 1}. ${exp.trim()}`);
  });
  console.log();
}

// 检查 lib/index.ts
const libFile = path.join(__dirname, 'src/lib/index.ts');
if (fs.existsSync(libFile)) {
  const libContent = fs.readFileSync(libFile, 'utf-8');
  const libExports = libContent.match(/export.*useCrossTreeManager/g) || [];
  console.log('2. 库入口文件 (lib/index.ts):');
  console.log(`   导出数量: ${libExports.length}`);
  libExports.forEach((exp, i) => {
    console.log(`   ${i + 1}. ${exp.trim()}`);
  });
  console.log();
}

// 检查 Tree.vue 中的使用
const treeFile = path.join(__dirname, 'src/components/Tree.vue');
if (fs.existsSync(treeFile)) {
  const treeContent = fs.readFileSync(treeFile, 'utf-8');
  const treeImports = treeContent.match(/import.*useCrossTreeManager/g) || [];
  const treeUsages = treeContent.match(/useCrossTreeManager\(\)/g) || [];
  console.log('3. Tree 组件 (Tree.vue):');
  console.log(`   导入数量: ${treeImports.length}`);
  console.log(`   使用数量: ${treeUsages.length}`);
  treeImports.forEach((imp, i) => {
    console.log(`   导入 ${i + 1}. ${imp.trim()}`);
  });
  console.log();
}

// 检查生成的类型文件
const distFile = path.join(__dirname, 'dist/index.d.ts');
if (fs.existsSync(distFile)) {
  const distContent = fs.readFileSync(distFile, 'utf-8');
  const distImports = distContent.match(/import.*useCrossTreeManager/g) || [];
  const distExports = distContent.match(/export.*useCrossTreeManager/g) || [];
  const distDeclarations = distContent.match(/declare.*useCrossTreeManager/g) || [];
  
  console.log('4. 生成的类型文件 (dist/index.d.ts):');
  console.log(`   导入数量: ${distImports.length}`);
  console.log(`   导出数量: ${distExports.length}`);
  console.log(`   声明数量: ${distDeclarations.length}`);
  
  if (distImports.length > 0) {
    console.log('   导入:');
    distImports.forEach((imp, i) => {
      console.log(`     ${i + 1}. ${imp.trim()}`);
    });
  }
  
  if (distExports.length > 0) {
    console.log('   导出:');
    distExports.forEach((exp, i) => {
      console.log(`     ${i + 1}. ${exp.trim()}`);
    });
  }
  
  if (distDeclarations.length > 0) {
    console.log('   声明:');
    distDeclarations.forEach((decl, i) => {
      console.log(`     ${i + 1}. ${decl.trim()}`);
    });
  }
  console.log();
}

console.log('=== 结论 ===');
console.log('构建过程中显示的 4 个 useCrossTreeManager 声明可能来自:');
console.log('1. 原始函数定义 (useCrossTreeManager.ts)');
console.log('2. lib/index.ts 的重新导出');
console.log('3. TypeScript 编译器的内部处理');
console.log('4. 模块依赖解析过程');
console.log('\n这些声明通常是正常的，只要最终的类型文件正确即可。');