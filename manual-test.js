// 手动测试跨树拖拽功能
console.log('🧪 开始手动测试跨树拖拽功能...');

// 等待页面完全加载
setTimeout(() => {
  console.log('🔍 查找DOM元素...');
  
  // 查找源节点（左侧树的第一个节点）
  const sourceNode = document.querySelector('#tree-a .p-tree-node-content');
  // 查找目标节点（右侧树的第一个节点）
  const targetNode = document.querySelector('#tree-b .p-tree-node-content');
  // 查找目标树容器
  const targetTree = document.querySelector('#tree-b .p-tree');
  
  console.log('🔍 源节点:', sourceNode);
  console.log('🔍 目标节点:', targetNode);
  console.log('🔍 目标树:', targetTree);
  
  if (!sourceNode || !targetTree) {
    console.error('❌ 找不到必要的DOM元素');
    return;
  }
  
  console.log('📝 源节点文本:', sourceNode.textContent);
  if (targetNode) {
    console.log('📝 目标节点文本:', targetNode.textContent);
  }
  
  // 检查节点的拖拽属性
  console.log('🔍 源节点 draggable 属性:', sourceNode.getAttribute('draggable'));
  console.log('🔍 源节点类名:', sourceNode.className);
  
  // 模拟完整的拖拽流程
  console.log('🚀 开始模拟拖拽流程...');
  
  // 1. 模拟 dragstart 事件
  const dragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
    dataTransfer: new DataTransfer()
  });
  
  // 设置拖拽数据
  const dragData = {
    nodeKey: 'a1',
    scope: 'test',
    sourceTreeId: 'tree-a'
  };
  dragStartEvent.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  dragStartEvent.dataTransfer.setData('sourceTreeId', 'tree-a');
  dragStartEvent.dataTransfer.effectAllowed = 'move';
  
  console.log('📦 设置拖拽数据:', dragData);
  
  sourceNode.dispatchEvent(dragStartEvent);
  console.log('✅ dragstart 事件已触发');
  
  // 2. 模拟 dragover 事件到目标树
  setTimeout(() => {
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      dataTransfer: dragStartEvent.dataTransfer
    });
    
    // 阻止默认行为以允许drop
    Object.defineProperty(dragOverEvent, 'preventDefault', {
      value: function() { this.defaultPrevented = true; },
      writable: false
    });
    dragOverEvent.preventDefault();
    
    const dropTarget = targetNode || targetTree;
    dropTarget.dispatchEvent(dragOverEvent);
    console.log('✅ dragover 事件已触发到:', dropTarget);
    
    // 3. 模拟 drop 事件
    setTimeout(() => {
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dragStartEvent.dataTransfer
      });
      
      dropTarget.dispatchEvent(dropEvent);
      console.log('✅ drop 事件已触发到:', dropTarget);
      
      // 4. 检查结果
      setTimeout(() => {
        console.log('🔍 检查拖拽结果...');
        
        // 检查页面上的数据显示
        const leftTreeData = document.querySelector('#tree-a + .data-display pre');
        const rightTreeData = document.querySelector('#tree-b + .data-display pre');
        
        console.log('📊 左侧树数据:', leftTreeData?.textContent);
        console.log('📊 右侧树数据:', rightTreeData?.textContent);
        
        // 检查节点数量
        const leftNodes = document.querySelectorAll('#tree-a .p-tree-node-content');
        const rightNodes = document.querySelectorAll('#tree-b .p-tree-node-content');
        
        console.log('📊 左侧树节点数量:', leftNodes.length);
        console.log('📊 右侧树节点数量:', rightNodes.length);
        
        if (rightNodes.length > 0) {
          console.log('🎉 拖拽成功！节点已添加到右侧树');
        } else {
          console.log('❌ 拖拽失败，右侧树节点数量没有增加');
        }
        
        // 检查日志区域
        const logs = document.querySelectorAll('.log-item');
        console.log('📝 页面日志数量:', logs.length);
        if (logs.length > 0) {
          console.log('📝 最新日志:', logs[logs.length - 1]?.textContent);
        }
      }, 1000);
    }, 200);
  }, 200);
}, 2000);