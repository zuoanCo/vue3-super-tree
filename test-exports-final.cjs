// 测试最终构建产物的导出
const fs = require('fs');
const path = require('path');

// 读取构建产物
const distPath = path.join(__dirname, 'dist');
const indexDts = path.join(distPath, 'index.d.ts');

if (fs.existsSync(indexDts)) {
  const content = fs.readFileSync(indexDts, 'utf-8');
  
  // 检查 useCrossTreeManager 的导出
  const useCrossTreeManagerExports = content.match(/export.*useCrossTreeManager/g) || [];
  const useCrossTreeManagerImports = content.match(/import.*useCrossTreeManager/g) || [];
  
  console.log('=== useCrossTreeManager 导出分析 ===');
  console.log('导出声明数量:', useCrossTreeManagerExports.length);
  console.log('导入声明数量:', useCrossTreeManagerImports.length);
  
  if (useCrossTreeManagerExports.length > 0) {
    console.log('导出声明:');
    useCrossTreeManagerExports.forEach((exp, i) => {
      console.log(`  ${i + 1}. ${exp}`);
    });
  }
  
  if (useCrossTreeManagerImports.length > 0) {
    console.log('导入声明:');
    useCrossTreeManagerImports.forEach((imp, i) => {
      console.log(`  ${i + 1}. ${imp}`);
    });
  }
  
  // 检查是否有函数定义
  const functionDefs = content.match(/export declare function useCrossTreeManager/g) || [];
  console.log('函数定义数量:', functionDefs.length);
  
  console.log('\n=== 结论 ===');
  if (useCrossTreeManagerExports.length === 1 && useCrossTreeManagerImports.length === 0) {
    console.log('✅ 导出正常，没有重复导入');
  } else if (useCrossTreeManagerImports.length > 0) {
    console.log('⚠️  存在外部导入，可能导致构建警告');
  } else {
    console.log('ℹ️  导出情况需要进一步检查');
  }
} else {
  console.log('❌ 找不到 dist/index.d.ts 文件');
}