// 拖拽位置测试脚本
// 在浏览器控制台中运行此脚本来测试不同的拖拽位置

function testDragPositions() {
  console.log('🧪 开始拖拽位置测试...')
  
  // 测试 above 位置
  console.log('\n📍 测试 above 位置:')
  console.log('将 tree1-0 拖拽到 tree2-0 的上方')
  
  // 测试 below 位置  
  console.log('\n📍 测试 below 位置:')
  console.log('将 tree1-1 拖拽到 tree2-0 的下方')
  
  // 测试 inside 位置
  console.log('\n📍 测试 inside 位置:')
  console.log('将 tree1-0-0 拖拽到 tree2-0 的内部')
  
  console.log('\n✅ 测试完成！检查树结构是否符合预期。')
}

// 运行测试
testDragPositions()