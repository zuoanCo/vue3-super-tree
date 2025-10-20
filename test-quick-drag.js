// 快速测试跨树拖拽功能
console.log('🧪 开始测试跨树拖拽功能...');

// 等待页面完全加载
setTimeout(() => {
  // 查找源节点（左侧树的第一个节点）
  const sourceNode = document.querySelector('.tree-container:first-child .p-tree-node-content');
  // 查找目标树（右侧树的根容器）
  const targetTree = document.querySelector('.tree-container:last-child .p-tree');
  
  console.log('🔍 源节点:', sourceNode);
  console.log('🔍 目标树:', targetTree);
  
  if (!sourceNode || !targetTree) {
    console.error('❌ 找不到源节点或目标树');
    return;
  }
  
  console.log('📝 源节点文本:', sourceNode.textContent);
  
  // 设置节点为可拖拽
  sourceNode.draggable = true;
  
  // 模拟拖拽开始
  console.log('🚀 开始拖拽...');
  const dragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
    dataTransfer: new DataTransfer()
  });
  
  // 设置拖拽数据
  dragStartEvent.dataTransfer.setData('text/plain', sourceNode.textContent);
  
  sourceNode.dispatchEvent(dragStartEvent);
  console.log('✅ dragstart 事件已触发');
  
  // 等待一下，然后模拟拖拽到目标
  setTimeout(() => {
    // 模拟 dragover
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      dataTransfer: dragStartEvent.dataTransfer
    });
    
    // 阻止默认行为以允许drop
    dragOverEvent.preventDefault();
    targetTree.dispatchEvent(dragOverEvent);
    console.log('✅ dragover 事件已触发');
    
    // 模拟 drop
    setTimeout(() => {
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dragStartEvent.dataTransfer
      });
      
      targetTree.dispatchEvent(dropEvent);
      console.log('✅ drop 事件已触发');
      
      // 检查结果
      setTimeout(() => {
        console.log('🔍 检查拖拽结果...');
        const leftTreeNodes = document.querySelectorAll('.tree-container:first-child .p-tree-node-content');
        const rightTreeNodes = document.querySelectorAll('.tree-container:last-child .p-tree-node-content');
        
        console.log('📊 左侧树节点数量:', leftTreeNodes.length);
        console.log('📊 右侧树节点数量:', rightTreeNodes.length);
        
        if (rightTreeNodes.length > 1) {
          console.log('🎉 拖拽成功！节点已添加到右侧树');
        } else {
          console.log('❌ 拖拽失败，右侧树节点数量没有增加');
        }
      }, 500);
    }, 100);
  }, 100);
}, 1000);