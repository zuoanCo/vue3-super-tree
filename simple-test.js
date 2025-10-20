// 简单测试拖拽
console.log('开始测试...');

setTimeout(() => {
  const sourceNode = document.querySelector('.tree-box:first-child .p-tree-node-content');
  const targetTree = document.querySelector('.tree-box:last-child .p-tree');
  
  console.log('源节点:', sourceNode?.textContent);
  console.log('目标树:', targetTree);
  
  if (sourceNode && targetTree) {
    // 模拟拖拽开始
    const dragEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer()
    });
    
    sourceNode.dispatchEvent(dragEvent);
    console.log('dragstart 触发');
    
    // 模拟放置
    setTimeout(() => {
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dragEvent.dataTransfer
      });
      
      targetTree.dispatchEvent(dropEvent);
      console.log('drop 触发');
    }, 100);
  }
}, 1000);