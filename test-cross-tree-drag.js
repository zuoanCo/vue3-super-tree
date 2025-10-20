// 跨树拖拽功能测试脚本
console.log('🚀 开始测试跨树拖拽功能...');

// 等待页面加载完成
setTimeout(() => {
  console.log('📋 页面加载完成，开始测试');
  
  // 查找源节点（Tree A中的节点）
  const sourceNode = document.querySelector('[data-tree-id="tree-a"] .p-tree-node-content');
  if (!sourceNode) {
    console.error('❌ 无法找到源节点');
    return;
  }
  
  // 查找目标节点（Tree B中的节点）
  const targetNode = document.querySelector('[data-tree-id="tree-b"] .p-tree-node-content');
  if (!targetNode) {
    console.error('❌ 无法找到目标节点');
    return;
  }
  
  console.log('✅ 找到源节点和目标节点');
  console.log('源节点:', sourceNode.textContent);
  console.log('目标节点:', targetNode.textContent);
  
  // 模拟拖拽开始
  const dragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
    dataTransfer: new DataTransfer()
  });
  
  // 设置拖拽数据
  dragStartEvent.dataTransfer.setData('text/plain', JSON.stringify({
    nodeKey: 'a1',
    scope: 'test',
    sourceTreeId: 'tree-a'
  }));
  
  console.log('🎯 触发拖拽开始事件');
  sourceNode.dispatchEvent(dragStartEvent);
  
  // 等待一下，然后模拟拖拽悬停
  setTimeout(() => {
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      dataTransfer: dragStartEvent.dataTransfer
    });
    
    console.log('🎯 触发拖拽悬停事件');
    targetNode.dispatchEvent(dragOverEvent);
    
    // 等待一下，然后模拟放置
    setTimeout(() => {
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dragStartEvent.dataTransfer
      });
      
      console.log('🎯 触发放置事件');
      targetNode.dispatchEvent(dropEvent);
      
      // 检查结果
      setTimeout(() => {
        console.log('🔍 检查拖拽结果...');
        
        // 检查Tree A的数据
        const treeANodes = document.querySelectorAll('[data-tree-id="tree-a"] .p-tree-node-content');
        console.log('Tree A 节点数量:', treeANodes.length);
        
        // 检查Tree B的数据
        const treeBNodes = document.querySelectorAll('[data-tree-id="tree-b"] .p-tree-node-content');
        console.log('Tree B 节点数量:', treeBNodes.length);
        
        // 检查日志
        const logItems = document.querySelectorAll('.log-item');
        console.log('操作日志数量:', logItems.length);
        
        if (logItems.length > 0) {
          console.log('最新日志:');
          Array.from(logItems).slice(-5).forEach(item => {
            console.log('  -', item.textContent);
          });
        }
        
        console.log('✅ 测试完成');
      }, 1000);
    }, 500);
  }, 500);
}, 2000);