<template>
  <div class="tree-demo">
    <!-- 调试信息 -->
    <div style="background: #dbeafe; color: #1e40af; padding: 10px; margin: 10px; border: 1px solid #93c5fd; border-radius: 6px;">
      TreeDemo 组件已渲染 - {{ new Date().toLocaleTimeString() }}
    </div>
    <!-- 页面标题 -->
    <div class="demo-header">
      <h1 class="demo-title">PrimeVue Tree Component Demo</h1>
      <p class="demo-description">
        完美复刻 PrimeVue Tree 组件的所有功能，包括基础展示、选择模式、拖拽排序、懒加载、过滤等特性。
      </p>
    </div>

    <!-- 主题切换器 -->
    <div class="theme-selector">
      <label for="theme-select" class="theme-label">主题选择：</label>
      <select 
        id="theme-select" 
        v-model="selectedTheme" 
        @change="handleThemeChange"
        class="theme-select"
      >
        <option v-for="theme in availableThemes" :key="theme.name" :value="theme.name">
          {{ theme.name }}
        </option>
      </select>
      <button @click="toggleDarkMode" class="theme-toggle">
        <Sun v-if="isDarkMode" :size="16" />
        <Moon v-else :size="16" />
        {{ isDarkMode ? '切换到亮色' : '切换到暗色' }}
      </button>
    </div>

    <!-- 演示区域 -->
    <div class="demo-grid">
      <!-- 基础展示 -->
      <div class="demo-section">
        <h2 class="section-title">基础展示</h2>
        <div class="demo-card">
          <Tree
            :value="basicTreeData"
            class="demo-tree"
          />
        </div>
      </div>

      <!-- 单选模式 -->
      <div class="demo-section">
        <h2 class="section-title">单选模式</h2>
        <div class="demo-card">
          <Tree
            :value="basicTreeData"
            selection-mode="single"
            v-model:selection-keys="singleSelection"
            class="demo-tree"
            @node-select="onNodeSelect"
            @node-unselect="onNodeUnselect"
          />
          <div class="selection-info">
            <strong>已选择：</strong>
            {{ singleSelection ? Object.keys(singleSelection).join(', ') : '无' }}
          </div>
        </div>
      </div>

      <!-- 多选模式 -->
      <div class="demo-section">
        <h2 class="section-title">多选模式</h2>
        <div class="demo-card">
          <Tree
            :value="basicTreeData"
            selection-mode="multiple"
            v-model:selection-keys="multipleSelection"
            class="demo-tree"
            @selection-change="onSelectionChange"
          />
          <div class="selection-info">
            <strong>已选择：</strong>
            {{ multipleSelection ? Object.keys(multipleSelection).join(', ') : '无' }}
          </div>
        </div>
      </div>

      <!-- 复选框模式 -->
      <div class="demo-section">
        <h2 class="section-title">复选框模式</h2>
        <div class="demo-card">
          <Tree
            :value="basicTreeData"
            selection-mode="checkbox"
            v-model:selection-keys="checkboxSelection"
            class="demo-tree"
            @selection-change="onSelectionChange"
          />
          <div class="selection-info">
            <strong>已选择：</strong>
            {{ checkboxSelection ? Object.keys(checkboxSelection).join(', ') : '无' }}
          </div>
        </div>
      </div>

      <!-- v-model 双向绑定演示 -->
      <div class="demo-section">
        <h2 class="section-title">v-model 双向绑定演示</h2>
        <div class="demo-card">
          <div class="mb-4">
            <h3 class="text-lg font-medium mb-2">外部控制选中状态</h3>
            <div class="flex gap-2 mb-4">
              <button 
                @click="selectNode('1')"
                class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                选中"文档"
              </button>
              <button 
                @click="selectNode('1-1-1')"
                class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                选中"项目计划.docx"
              </button>
              <button 
                @click="selectMultipleNodes(['2', '3'])"
                class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                选中"图片"和"代码"
              </button>
              <button 
                @click="clearAllSelections"
                class="px-3 py-1 bg-blue-200 text-blue-800 rounded text-sm hover:bg-blue-300"
              >
                清空选择
              </button>
            </div>
          </div>
          <Tree
            :value="basicTreeData"
            selection-mode="multiple"
            v-model="vModelSelection"
            class="demo-tree"
            @selection-change="onVModelSelectionChange"
            @node-focus="onNodeFocus"
            @node-blur="onNodeBlur"
            @node-click="onNodeClick"
          />
          <div class="selection-info">
            <div class="mb-2">
              <strong>v-model 选中值：</strong>
              {{ vModelSelection ? Object.keys(vModelSelection).join(', ') : '无' }}
            </div>
            <div class="mb-2">
              <strong>当前焦点节点：</strong>
              {{ currentFocusedNode || '无' }}
            </div>
            <div class="text-sm text-gray-600">
              使用键盘方向键导航，Enter/Space 键选择节点
            </div>
          </div>
        </div>
      </div>

      <!-- 键盘导航演示 -->
      <div class="demo-section">
        <h2 class="section-title">键盘导航演示</h2>
        <div class="demo-card">
          <div class="mb-4">
            <h3 class="text-lg font-medium mb-2">键盘快捷键</h3>
            <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <strong>导航键：</strong>
                <ul class="list-disc list-inside text-gray-600">
                  <li>↑/↓ - 上下移动焦点</li>
                  <li>Home - 移动到第一个节点</li>
                  <li>End - 移动到最后一个节点</li>
                </ul>
              </div>
              <div>
                <strong>操作键：</strong>
                <ul class="list-disc list-inside text-gray-600">
                  <li>Enter/Space - 选择/取消选择节点</li>
                  <li>Escape - 清除焦点</li>
                </ul>
              </div>
            </div>
            <div class="flex gap-2 mb-4">
              <button 
                @click="focusFirstNode"
                class="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
              >
                焦点到第一个节点
              </button>
              <button 
                @click="focusLastNode"
                class="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
              >
                焦点到最后一个节点
              </button>
              <button 
                @click="clearFocus"
                class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                清除焦点
              </button>
            </div>
          </div>
          <Tree
            ref="keyboardTreeRef"
            :value="basicTreeData"
            selection-mode="single"
            v-model="keyboardSelection"
            class="demo-tree"
            @node-focus="onKeyboardNodeFocus"
            @node-blur="onKeyboardNodeBlur"
            @selection-change="onKeyboardSelectionChange"
          />
          <div class="selection-info">
            <div class="mb-2">
              <strong>选中节点：</strong>
              {{ keyboardSelection ? Object.keys(keyboardSelection).join(', ') : '无' }}
            </div>
            <div class="mb-2">
              <strong>焦点节点：</strong>
              {{ keyboardFocusedNode || '无' }}
            </div>
            <div class="text-sm text-gray-600">
              点击树组件获得焦点，然后使用键盘导航
            </div>
          </div>
        </div>
      </div>

      <!-- 过滤功能 -->
      <div class="demo-section">
        <h2 class="section-title">过滤功能</h2>
        <div class="demo-card">
          <Tree
            :value="largeTreeData"
            filter
            filter-mode="lenient"
            filter-placeholder="搜索节点..."
            class="demo-tree"
            @filter="onFilter"
          />
        </div>
      </div>

      <!-- 自定义颜色演示 -->
      <div class="demo-section full-width">
        <h2 class="section-title">自定义颜色演示</h2>
        <div class="demo-grid">
          <!-- 默认颜色 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">默认颜色</h3>
            <Tree
              :value="basicTreeData"
              selection-mode="single"
              v-model="colorDemoSelection1"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ colorDemoSelection1 ? Object.keys(colorDemoSelection1).join(', ') : '无' }}
            </div>
          </div>

          <!-- 自定义蓝色主题 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">蓝色主题</h3>
            <Tree
              :value="basicTreeData"
              selection-mode="single"
              v-model="colorDemoSelection2"
              selected-background-color="#3b82f6"
              selected-text-color="white"
              focus-background-color="#1d4ed8"
              focus-text-color="white"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ colorDemoSelection2 ? Object.keys(colorDemoSelection2).join(', ') : '无' }}
            </div>
          </div>

          <!-- 自定义绿色主题 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">绿色主题</h3>
            <Tree
              :value="basicTreeData"
              selection-mode="single"
              v-model="colorDemoSelection3"
              selected-background-color="#10b981"
              selected-text-color="white"
              focus-background-color="#059669"
              focus-text-color="white"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ colorDemoSelection3 ? Object.keys(colorDemoSelection3).join(', ') : '无' }}
            </div>
          </div>

          <!-- 自定义紫色主题 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">紫色主题</h3>
            <Tree
              :value="basicTreeData"
              selection-mode="single"
              v-model="colorDemoSelection4"
              selected-background-color="#8b5cf6"
              selected-text-color="white"
              focus-background-color="#7c3aed"
              focus-text-color="white"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ colorDemoSelection4 ? Object.keys(colorDemoSelection4).join(', ') : '无' }}
            </div>
          </div>

          <!-- 动态颜色控制 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">动态颜色控制</h3>
            <div class="color-controls mb-4">
              <div class="control-group">
                <label class="control-label">选中背景色：</label>
                <input 
                  type="color" 
                  v-model="customSelectedBg" 
                  class="color-input"
                />
                <span class="color-value">{{ customSelectedBg }}</span>
              </div>
              <div class="control-group">
                <label class="control-label">选中文字色：</label>
                <input 
                  type="color" 
                  v-model="customSelectedText" 
                  class="color-input"
                />
                <span class="color-value">{{ customSelectedText }}</span>
              </div>
              <div class="control-group">
                <label class="control-label">焦点背景色：</label>
                <input 
                  type="color" 
                  v-model="customFocusBg" 
                  class="color-input"
                />
                <span class="color-value">{{ customFocusBg }}</span>
              </div>
              <div class="control-group">
                <label class="control-label">焦点文字色：</label>
                <input 
                  type="color" 
                  v-model="customFocusText" 
                  class="color-input"
                />
                <span class="color-value">{{ customFocusText }}</span>
              </div>
            </div>
            <Tree
              :value="basicTreeData"
              selection-mode="single"
              v-model="colorDemoSelection5"
              :selected-background-color="customSelectedBg"
              :selected-text-color="customSelectedText"
              :focus-background-color="customFocusBg"
              :focus-text-color="customFocusText"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ colorDemoSelection5 ? Object.keys(colorDemoSelection5).join(', ') : '无' }}
            </div>
          </div>

          <!-- 多选模式颜色演示 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">多选模式颜色演示</h3>
            <Tree
              :value="basicTreeData"
              selection-mode="multiple"
              v-model="colorDemoSelectionMultiple"
              selected-background-color="#f59e0b"
              selected-text-color="white"
              focus-background-color="#d97706"
              focus-text-color="white"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ colorDemoSelectionMultiple ? Object.keys(colorDemoSelectionMultiple).join(', ') : '无' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 缩进演示 -->
      <div class="demo-section full-width">
        <h2 class="section-title">缩进演示</h2>
        <div class="demo-grid">
          <!-- 默认缩进 (20px) -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">默认缩进 (20px)</h3>
            <Tree
              :value="basicTreeData"
              selection-mode="single"
              v-model="indentDemoSelection1"
              :indent="20"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ indentDemoSelection1 ? Object.keys(indentDemoSelection1).join(', ') : '无' }}
            </div>
          </div>

          <!-- 小缩进 (10px) -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">小缩进 (10px)</h3>
            <Tree
              :value="basicTreeData"
              selection-mode="single"
              v-model="indentDemoSelection2"
              :indent="10"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ indentDemoSelection2 ? Object.keys(indentDemoSelection2).join(', ') : '无' }}
            </div>
          </div>

          <!-- 大缩进 (40px) -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">大缩进 (40px)</h3>
            <Tree
              :value="basicTreeData"
              selection-mode="single"
              v-model="indentDemoSelection3"
              :indent="40"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ indentDemoSelection3 ? Object.keys(indentDemoSelection3).join(', ') : '无' }}
            </div>
          </div>

          <!-- 超大缩进 (60px) -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">超大缩进 (60px)</h3>
            <Tree
              :value="basicTreeData"
              selection-mode="single"
              v-model="indentDemoSelection4"
              :indent="60"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ indentDemoSelection4 ? Object.keys(indentDemoSelection4).join(', ') : '无' }}
            </div>
          </div>

          <!-- 动态缩进控制 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">动态缩进控制</h3>
            <div class="indent-controls mb-4">
              <div class="control-group">
                <label class="control-label">缩进大小：</label>
                <input 
                  type="range" 
                  v-model="customIndent" 
                  min="5" 
                  max="100" 
                  step="5"
                  class="indent-slider"
                />
                <span class="indent-value">{{ customIndent }}px</span>
              </div>
            </div>
            <Tree
              :value="basicTreeData"
              selection-mode="single"
              v-model="indentDemoSelection5"
              :indent="customIndent"
              class="demo-tree"
            />
            <div class="selection-info">
              <strong>已选择：</strong>
              {{ indentDemoSelection5 ? Object.keys(indentDemoSelection5).join(', ') : '无' }}
            </div>
          </div>

          <!-- 缩进对比 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">缩进对比</h3>
            <div class="indent-comparison">
              <div class="comparison-item">
                <h4 class="text-sm font-medium mb-2">紧凑模式 (8px)</h4>
                <Tree
                  :value="basicTreeData"
                  selection-mode="single"
                  :indent="8"
                  class="demo-tree compact"
                />
              </div>
              <div class="comparison-item">
                <h4 class="text-sm font-medium mb-2">宽松模式 (50px)</h4>
                <Tree
                  :value="basicTreeData"
                  selection-mode="single"
                  :indent="50"
                  class="demo-tree spacious"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 拖拽排序 -->
      <div class="demo-section full-width">
        <h2 class="section-title">拖拽排序</h2>
        <div class="demo-grid">
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">拖拽树</h3>
            <Tree
              :value="draggableTreeData"
              selection-mode="single"
              :dragdrop="true"
              dragdrop-scope="demo"
              :expanded-keys="draggableExpandedKeys"
              class="demo-tree"
              @node-drop="onNodeDrop"
              @update:expanded-keys="draggableExpandedKeys = $event"
            />
            <div class="drag-info">
              <p class="text-sm text-gray-600">
                拖拽节点到其他位置进行重新排序
              </p>
            </div>
          </div>
          
          <!-- 拖拽信息面板 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">拖拽详细信息</h3>
            <div v-if="lastDragInfo" class="drag-details">
              <!-- 基本信息 -->
              <div class="info-section">
                <h4 class="info-title">基本信息</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">拖拽节点:</span>
                    <span class="info-value">{{ lastDragInfo.dragNodeInfo.label }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">节点Key:</span>
                    <span class="info-value">{{ lastDragInfo.dragNodeInfo.key }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">目标节点:</span>
                    <span class="info-value">{{ lastDragInfo.dropNodeInfo.label }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">拖拽位置:</span>
                    <span class="info-value position-badge" :class="`position-${lastDragInfo.position}`">
                      {{ lastDragInfo.position }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 位置对比 -->
              <div class="info-section">
                <h4 class="info-title">位置变化</h4>
                <div class="position-comparison">
                  <div class="position-before">
                    <h5 class="position-title">拖拽前</h5>
                    <div class="position-details">
                      <div class="position-item">
                        <span class="position-label">父节点:</span>
                        <span class="position-value">{{ lastDragInfo.before?.parentLabel || '根目录' }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">索引:</span>
                        <span class="position-value">{{ lastDragInfo.before?.index ?? 0 }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">层级:</span>
                        <span class="position-value">{{ lastDragInfo.before?.level ?? 0 }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">路径:</span>
                        <span class="position-value">{{ lastDragInfo.before?.path || '根目录' }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="position-arrow">→</div>
                  
                  <div class="position-after">
                    <h5 class="position-title">拖拽后</h5>
                    <div class="position-details">
                      <div class="position-item">
                        <span class="position-label">父节点:</span>
                        <span class="position-value">{{ lastDragInfo.after?.parentLabel || '根目录' }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">索引:</span>
                        <span class="position-value">{{ lastDragInfo.after?.index ?? 0 }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">层级:</span>
                        <span class="position-value">{{ lastDragInfo.after?.level ?? 0 }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">路径:</span>
                        <span class="position-value">{{ lastDragInfo.after?.path || '根目录' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 节点属性 -->
              <div class="info-section">
                <h4 class="info-title">节点属性</h4>
                <div class="node-properties">
                  <div class="property-group">
                    <h5 class="property-title">拖拽节点</h5>
                    <div class="property-list">
                      <div class="property-item">
                        <span class="property-label">是否有子节点:</span>
                        <span class="property-value" :class="lastDragInfo.dragNodeInfo.hasChildren ? 'text-green-600' : 'text-gray-500'">
                          {{ lastDragInfo.dragNodeInfo.hasChildren ? '是' : '否' }}
                        </span>
                      </div>
                      <div class="property-item">
                        <span class="property-label">子节点数量:</span>
                        <span class="property-value">{{ lastDragInfo.dragNodeInfo.childrenCount }}</span>
                      </div>
                      <div class="property-item">
                        <span class="property-label">是否为叶子节点:</span>
                        <span class="property-value" :class="lastDragInfo.dragNodeInfo.isLeaf ? 'text-blue-600' : 'text-gray-500'">
                          {{ lastDragInfo.dragNodeInfo.isLeaf ? '是' : '否' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="property-group">
                    <h5 class="property-title">目标节点</h5>
                    <div class="property-list">
                      <div class="property-item">
                        <span class="property-label">是否有子节点:</span>
                        <span class="property-value" :class="lastDragInfo.dropNodeInfo.hasChildren ? 'text-green-600' : 'text-gray-500'">
                          {{ lastDragInfo.dropNodeInfo.hasChildren ? '是' : '否' }}
                        </span>
                      </div>
                      <div class="property-item">
                        <span class="property-label">子节点数量:</span>
                        <span class="property-value">{{ lastDragInfo.dropNodeInfo.childrenCount }}</span>
                      </div>
                      <div class="property-item">
                        <span class="property-label">是否为叶子节点:</span>
                        <span class="property-value" :class="lastDragInfo.dropNodeInfo.isLeaf ? 'text-blue-600' : 'text-gray-500'">
                          {{ lastDragInfo.dropNodeInfo.isLeaf ? '是' : '否' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="no-drag-info">
              <p class="text-gray-500 text-center py-8">
                执行拖拽操作后，这里将显示详细的拖拽信息
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 跨树拖拽 -->
      <div class="demo-section full-width">
        <h2 class="section-title">跨树拖拽</h2>
        <div class="mb-4 flex gap-4">
          <button 
            @click="testCrossTreeDrag"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            测试跨树拖拽 (tree1-1-0 → tree2)
          </button>
          
          <button 
            @click="testRealDrag"
            class="px-4 py-2 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 transition-colors"
          >
            🔥 真实拖拽测试
          </button>
          
          <button 
            @click="testNewNodeDrag"
            class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            🧪 测试新插入节点拖拽
          </button>
          
          <button 
            @click="resetCrossTreeData"
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            重置数据
          </button>
          <button 
            @click="logCurrentData"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            📊 查看当前数据
          </button>
          <button 
            @click="runFullTest"
            class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            🚀 完整功能测试
          </button>
        </div>
        <div class="demo-grid">
          <!-- 源树 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">源树 (项目文件)</h3>
            <Tree
              ref="crossTree1Ref"
              id="tree1"
              :value="crossTreeData1"
              selection-mode="single"
              :dragdrop="true"
              cross-tree-group="demo-group"
              :expanded-keys="crossTreeExpandedKeys1"
              class="demo-tree cross-tree"
              @cross-tree-move="onCrossTreeMove"
              @update:value="crossTreeData1 = $event"
              @update:expanded-keys="crossTreeExpandedKeys1 = $event"
            />
            <div class="tree-info">
              <p class="text-sm text-gray-600">
                从这个树拖拽节点到右侧的目标树
              </p>
            </div>
          </div>
          
          <!-- 目标树 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">目标树 (资源文件)</h3>
            <Tree
              ref="crossTree2Ref"
              id="tree2"
              :value="crossTreeData2"
              selection-mode="single"
              :dragdrop="true"
              cross-tree-group="demo-group"
              :expanded-keys="crossTreeExpandedKeys2"
              class="demo-tree cross-tree"
              @cross-tree-move="onCrossTreeMove"
              @update:value="crossTreeData2 = $event"
              @update:expanded-keys="crossTreeExpandedKeys2 = $event"
            />
            <div class="tree-info">
              <p class="text-sm text-gray-600">
                接收从左侧源树拖拽过来的节点
              </p>
            </div>
          </div>
          
          <!-- 拖拽状态指示器 -->
          <div v-if="isDragging" class="demo-card drag-status-indicator">
            <div class="flex items-center space-x-2">
              <div class="animate-pulse w-3 h-3 bg-blue-500 rounded-full"></div>
              <span class="text-blue-600 font-medium">正在拖拽中...</span>
              <span v-if="currentDragInfo" class="text-gray-600">
                "{{ currentDragInfo.label }}"
              </span>
            </div>
          </div>

          <!-- 跨树拖拽信息面板 - 已修复所有拖拽逻辑问题 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">跨树拖拽详细信息</h3>
            
            <!-- 实时跨树拖拽悬停信息 -->
            <div v-if="isDragging && currentHoverInfo && currentHoverInfo.isCrossTree" class="drag-details mb-4 border-b pb-4">
              <h4 class="text-md font-medium mb-2 text-green-600">跨树拖拽状态</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">拖拽节点:</span>
                  <span class="info-value">{{ currentDragInfo?.label || '未知' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">目标树ID:</span>
                  <span class="info-value">{{ currentHoverInfo.targetTreeId || '无' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">目标节点:</span>
                  <span class="info-value">{{ currentHoverInfo.dropNodeLabel || '无' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">拖拽位置:</span>
                  <span class="info-value position-badge" :class="`position-${currentHoverInfo.dropPosition}`">
                    {{ currentHoverInfo.dropPosition || '无' }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">是否跨树:</span>
                  <span class="info-value" :class="currentHoverInfo.isCrossTree ? 'text-green-600' : 'text-blue-600'">
                    {{ currentHoverInfo.isCrossTree ? '是' : '否' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 同树内拖拽悬停信息 -->
            <div v-else-if="isDragging && currentHoverInfo && !currentHoverInfo.isCrossTree" class="drag-details mb-4 border-b pb-4">
              <h4 class="text-md font-medium mb-2 text-blue-600">同树内拖拽状态</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">拖拽节点:</span>
                  <span class="info-value">{{ currentDragInfo?.label || '未知' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">目标节点:</span>
                  <span class="info-value">{{ currentHoverInfo.dropNodeLabel || '无' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">拖拽位置:</span>
                  <span class="info-value position-badge" :class="`position-${currentHoverInfo.dropPosition}`">
                    {{ currentHoverInfo.dropPosition || '无' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 仅在拖拽时且没有悬停信息时显示基本状态 -->
            <div v-else-if="isDragging" class="drag-details mb-4 border-b pb-4">
              <h4 class="text-md font-medium mb-2 text-gray-600">拖拽状态</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">拖拽节点:</span>
                  <span class="info-value">{{ currentDragInfo?.label || '未知' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">状态:</span>
                  <span class="info-value text-gray-600">正在拖拽中...</span>
                </div>
              </div>
            </div>
            
            <!-- 最后一次拖拽结果 -->
            <div v-if="lastCrossTreeDragInfo" class="drag-details">
              <!-- 跨树基本信息 -->
              <div class="info-section">
                <h4 class="info-title">跨树信息</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">源树ID:</span>
                    <span class="info-value">{{ lastCrossTreeDragInfo.sourceTreeId }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">目标树ID:</span>
                    <span class="info-value">{{ lastCrossTreeDragInfo.targetTreeId }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">是否跨树:</span>
                    <span class="info-value" :class="lastCrossTreeDragInfo.isCrossTree ? 'text-green-600' : 'text-blue-600'">
                      {{ lastCrossTreeDragInfo.isCrossTree ? '是' : '否' }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">拖拽节点:</span>
                    <span class="info-value">{{ lastCrossTreeDragInfo.dragNodeInfo.label }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">目标节点:</span>
                    <span class="info-value">{{ lastCrossTreeDragInfo.dropNodeInfo.label }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">拖拽位置:</span>
                    <span class="info-value position-badge" :class="`position-${lastCrossTreeDragInfo.position}`">
                      {{ lastCrossTreeDragInfo.position }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 位置对比 -->
              <div class="info-section">
                <h4 class="info-title">位置变化</h4>
                <div class="position-comparison">
                  <div class="position-before">
                    <h5 class="position-title">拖拽前 ({{ lastCrossTreeDragInfo.sourceTreeId }})</h5>
                    <div class="position-details">
                      <div class="position-item">
                        <span class="position-label">父节点:</span>
                        <span class="position-value">{{ lastCrossTreeDragInfo.before?.parentLabel || '根目录' }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">索引:</span>
                        <span class="position-value">{{ lastCrossTreeDragInfo.before?.index ?? 0 }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">层级:</span>
                        <span class="position-value">{{ lastCrossTreeDragInfo.before?.level ?? 0 }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">路径:</span>
                        <span class="position-value">{{ lastCrossTreeDragInfo.before?.path || '根目录' }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="position-arrow">→</div>
                  
                  <div class="position-after">
                    <h5 class="position-title">拖拽后 ({{ lastCrossTreeDragInfo.targetTreeId }})</h5>
                    <div class="position-details">
                      <div class="position-item">
                        <span class="position-label">父节点:</span>
                        <span class="position-value">{{ lastCrossTreeDragInfo.after?.parentLabel || '根目录' }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">索引:</span>
                        <span class="position-value">{{ lastCrossTreeDragInfo.after?.index ?? 0 }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">层级:</span>
                        <span class="position-value">{{ lastCrossTreeDragInfo.after?.level ?? 0 }}</span>
                      </div>
                      <div class="position-item">
                        <span class="position-label">路径:</span>
                        <span class="position-value">{{ lastCrossTreeDragInfo.after?.path || '根目录' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 节点属性 -->
              <div class="info-section">
                <h4 class="info-title">节点属性</h4>
                <div class="node-properties">
                  <div class="property-group">
                    <h5 class="property-title">拖拽节点</h5>
                    <div class="property-list">
                      <div class="property-item">
                        <span class="property-label">是否有子节点:</span>
                        <span class="property-value" :class="lastCrossTreeDragInfo.dragNodeInfo.hasChildren ? 'text-green-600' : 'text-gray-500'">
                          {{ lastCrossTreeDragInfo.dragNodeInfo.hasChildren ? '是' : '否' }}
                        </span>
                      </div>
                      <div class="property-item">
                        <span class="property-label">子节点数量:</span>
                        <span class="property-value">{{ lastCrossTreeDragInfo.dragNodeInfo.childrenCount }}</span>
                      </div>
                      <div class="property-item">
                        <span class="property-label">是否为叶子节点:</span>
                        <span class="property-value" :class="lastCrossTreeDragInfo.dragNodeInfo.isLeaf ? 'text-blue-600' : 'text-gray-500'">
                          {{ lastCrossTreeDragInfo.dragNodeInfo.isLeaf ? '是' : '否' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="property-group">
                    <h5 class="property-title">目标节点</h5>
                    <div class="property-list">
                      <div class="property-item">
                        <span class="property-label">是否有子节点:</span>
                        <span class="property-value" :class="lastCrossTreeDragInfo.dropNodeInfo.hasChildren ? 'text-green-600' : 'text-gray-500'">
                          {{ lastCrossTreeDragInfo.dropNodeInfo.hasChildren ? '是' : '否' }}
                        </span>
                      </div>
                      <div class="property-item">
                        <span class="property-label">子节点数量:</span>
                        <span class="property-value">{{ lastCrossTreeDragInfo.dropNodeInfo.childrenCount }}</span>
                      </div>
                      <div class="property-item">
                        <span class="property-label">是否为叶子节点:</span>
                        <span class="property-value" :class="lastCrossTreeDragInfo.dropNodeInfo.isLeaf ? 'text-blue-600' : 'text-gray-500'">
                          {{ lastCrossTreeDragInfo.dropNodeInfo.isLeaf ? '是' : '否' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="no-drag-info">
              <p class="text-gray-500 text-center py-8">
                执行跨树拖拽操作后，这里将显示详细的跨树拖拽信息
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 懒加载 -->
      <div class="demo-section">
        <h2 class="section-title">懒加载</h2>
        <div class="demo-card">
          <Tree
            :value="lazyTreeData"
            class="demo-tree"
            @node-expand="onNodeExpand"
          />
          <div class="lazy-info">
            <p class="text-sm text-gray-600">
              点击展开按钮动态加载子节点
            </p>
          </div>
        </div>
      </div>

      <!-- 跨树拖拽自动更新演示 -->
      <!-- 简化的跨树拖拽演示 -->
      <div class="demo-section full-width">
        <h2 class="section-title">简化跨树拖拽演示</h2>
        <p class="text-gray-600 mb-4">
          演示组件内部自动处理跨树拖拽，只需配置 <code>cross-tree-group</code> 属性即可。
        </p>
        
        <div class="demo-grid">
          <!-- 简化源树 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">源树</h3>
            <Tree
              id="simple-tree1"
              :value="simpleTreeData1"
              :dragdrop="true"
              dragdrop-scope="simple-demo"
              selection-mode="single"
              cross-tree-group="simple-demo"
              :expanded-keys="simpleExpandedKeys1"
              class="demo-tree cross-tree"
              @cross-tree-move="onSimpleCrossTreeMove"
              @update:expanded-keys="simpleExpandedKeys1 = $event"
              @update:value="simpleTreeData1 = $event"
            />
            <div class="tree-info">
              <p class="text-sm text-gray-600">
                配置了 cross-tree-group="simple-demo"
              </p>
            </div>
          </div>
          
          <!-- 简化目标树 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">目标树</h3>
            <Tree
              id="simple-tree2"
              :value="simpleTreeData2"
              :dragdrop="true"
              dragdrop-scope="simple-demo"
              selection-mode="single"
              cross-tree-group="simple-demo"
              :expanded-keys="simpleExpandedKeys2"
              class="demo-tree cross-tree"
              @cross-tree-move="onSimpleCrossTreeMove"
              @update:expanded-keys="simpleExpandedKeys2 = $event"
              @update:value="simpleTreeData2 = $event"
            />
            <div class="tree-info">
              <p class="text-sm text-gray-600">
                配置了 cross-tree-group="simple-demo"
              </p>
            </div>
          </div>
          
          <!-- 简化控制面板 -->
          <div class="demo-card">
            <h3 class="text-lg font-medium mb-4">操作控制</h3>
            <div class="space-y-4">
              <div class="control-group">
                <h4 class="text-md font-medium mb-2">演示操作</h4>
                <div class="flex gap-2 flex-wrap">
                  <button 
                    @click="resetSimpleDemo"
                    class="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  >
                    重置数据
                  </button>
                  <button 
                    @click="testSimpleCrossTreeDrag"
                    class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                  >
                    测试拖拽
                  </button>
                </div>
              </div>
              
              <div class="control-group">
                <h4 class="text-md font-medium mb-2">使用说明</h4>
                <div class="text-sm text-gray-600 space-y-1">
                  <p>• 只需为两个树设置相同的 <code>cross-tree-group</code></p>
                  <p>• 监听 <code>@cross-tree-move</code> 事件获取拖拽信息</p>
                  <p>• 组件内部自动处理数据移动和更新</p>
                  <p>• 无需手动实现复杂的拖拽逻辑</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义模板 -->
      <div class="demo-section">
        <h2 class="section-title">自定义模板</h2>
        <div class="demo-card">
          <Tree
            :value="customTreeData"
            selection-mode="single"
            class="demo-tree"
          >
            <template #node="{ node }">
              <div class="custom-node">
                <component 
                  :is="getNodeIcon(node)" 
                  :size="16" 
                  class="node-icon"
                />
                <span class="node-label">{{ node.label }}</span>
                <span v-if="node.data?.count" class="node-badge">
                  {{ node.data.count }}
                </span>
              </div>
            </template>
          </Tree>
        </div>
      </div>

      <!-- 事件日志 -->
      <div class="demo-section full-width">
        <h2 class="section-title">事件日志</h2>
        <div class="demo-card">
          <div class="event-log">
            <div class="log-header">
              <span>最近事件</span>
              <button @click="clearEventLog" class="clear-btn">
                <Trash2 :size="14" />
                清空
              </button>
            </div>
            <div class="log-content">
              <div 
                v-for="(event, index) in eventLog" 
                :key="index"
                class="log-item"
                :class="{ 'log-item-detailed': event.details }"
              >
                <div class="log-header-row">
                  <span class="log-time">{{ event.time }}</span>
                  <span class="log-type">{{ event.type }}</span>
                  <span class="log-message">{{ event.message }}</span>
                </div>
                
                <!-- 详细信息展开区域 -->
                <div v-if="event.details" class="log-details">
                  <div class="detail-section">
                    <h5 class="detail-title">拖拽信息</h5>
                    <div class="detail-grid">
                      <div class="detail-item">
                        <span class="detail-label">拖拽节点:</span>
                        <span class="detail-value">{{ event.details.dragNode?.label || 'N/A' }} ({{ event.details.dragNode?.key || 'N/A' }})</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">目标节点:</span>
                        <span class="detail-value">{{ event.details.dropNode?.label || 'N/A' }} ({{ event.details.dropNode?.key || 'N/A' }})</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">拖拽位置:</span>
                        <span class="detail-value position-badge" :class="`position-${event.details.position}`">
                          {{ event.details.position === 'above' ? '上方' : event.details.position === 'below' ? '下方' : '内部' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="detail-section">
                    <h5 class="detail-title">位置变化</h5>
                    <div class="position-comparison">
                      <div class="position-before">
                        <h6 class="position-subtitle">拖拽前</h6>
                        <div class="position-info">
                          <div class="position-detail">
                            <span class="position-label">父节点:</span>
                            <span class="position-value">{{ event.details.before?.parentLabel || '根目录' }}</span>
                          </div>
                          <div class="position-detail">
                            <span class="position-label">索引:</span>
                            <span class="position-value">{{ event.details.before?.index ?? 0 }}</span>
                          </div>
                          <div class="position-detail">
                            <span class="position-label">层级:</span>
                            <span class="position-value">{{ event.details.before?.level ?? 0 }}</span>
                          </div>
                          <div class="position-detail">
                            <span class="position-label">路径:</span>
                            <span class="position-value">{{ event.details.before?.path || '根目录' }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div class="position-arrow">→</div>
                      
                      <div class="position-after">
                        <h6 class="position-subtitle">拖拽后</h6>
                        <div class="position-info">
                          <div class="position-detail">
                            <span class="position-label">父节点:</span>
                            <span class="position-value">{{ event.details.after?.parentLabel || '根目录' }}</span>
                          </div>
                          <div class="position-detail">
                            <span class="position-label">索引:</span>
                            <span class="position-value">{{ event.details.after?.index ?? 0 }}</span>
                          </div>
                          <div class="position-detail">
                            <span class="position-label">层级:</span>
                            <span class="position-value">{{ event.details.after?.level ?? 0 }}</span>
                          </div>
                          <div class="position-detail">
                            <span class="position-label">路径:</span>
                            <span class="position-value">{{ event.details.after?.path || '根目录' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="detail-section">
                    <h5 class="detail-title">节点属性</h5>
                    <div class="node-properties">
                      <div class="node-property-group">
                        <h6 class="property-group-title">拖拽节点</h6>
                        <div class="property-list">
                          <div class="property-item">
                            <span class="property-label">子节点数:</span>
                            <span class="property-value">{{ event.details.dragNode?.childrenCount || 0 }}</span>
                          </div>
                          <div class="property-item">
                            <span class="property-label">是否叶子节点:</span>
                            <span class="property-value">{{ event.details.dragNode?.isLeaf ? '是' : '否' }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div class="node-property-group">
                        <h6 class="property-group-title">目标节点</h6>
                        <div class="property-list">
                          <div class="property-item">
                            <span class="property-label">子节点数:</span>
                            <span class="property-value">{{ event.details.dropNode?.childrenCount || 0 }}</span>
                          </div>
                          <div class="property-item">
                            <span class="property-label">是否叶子节点:</span>
                            <span class="property-value">{{ event.details.dropNode?.isLeaf ? '是' : '否' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="eventLog.length === 0" class="log-empty">
                暂无事件记录
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, type Ref } from 'vue'
import { Sun, Moon, Trash2, Folder, File, User, Settings, Database, Code } from 'lucide-vue-next'
import Tree from '../components/Tree.vue'
import { useTreeTheme, availableThemes } from '../lib/themes'
import { generateSampleData, moveTreeNode, getNodePosition, formatDragInfo, getCrossTreeSampleData, moveCrossTreeNode, formatCrossTreeDragInfo, findTreeNode } from '../lib/utils'
import type { TreeNode, TreeSelectionKeys, TreeExpandedKeys, TreeDropPosition } from '../lib/types'
import { resetGlobalDragState } from '../composables/useDragDrop'

// 调试信息
console.log('🔍 TreeDemo.vue loaded')

// 立即执行跨树拖拽测试
console.log('🧪 立即执行跨树拖拽测试...')
setTimeout(() => {
  console.log('🚀 开始跨树拖拽测试')
  // 执行实际的跨树拖拽测试
  testCrossTreeDrag()
}, 2000)

// 主题管理
const { applyTheme, toggleDarkMode: themeToggleDarkMode } = useTreeTheme()
const selectedTheme = ref('lara-light')
const isDarkMode = ref(false)

// 选择状态
const singleSelection = ref<TreeSelectionKeys>({})
const multipleSelection = ref<TreeSelectionKeys>({})
const checkboxSelection = ref<TreeSelectionKeys>({})

// v-model 演示相关状态
const vModelSelection = ref<TreeSelectionKeys>({})
const currentFocusedNode = ref<string | null>(null)

// 键盘导航演示相关状态
const keyboardSelection = ref<TreeSelectionKeys>({})
const keyboardFocusedNode = ref<string | null>(null)
const keyboardTreeRef = ref<any>(null)

// 跨树拖拽组件引用
const crossTree1Ref = ref<any>(null)
const crossTree2Ref = ref<any>(null)

// 颜色演示相关状态
const colorDemoSelection1 = ref<TreeSelectionKeys>({})
const colorDemoSelection2 = ref<TreeSelectionKeys>({})
const colorDemoSelection3 = ref<TreeSelectionKeys>({})
const colorDemoSelection4 = ref<TreeSelectionKeys>({})
const colorDemoSelection5 = ref<TreeSelectionKeys>({})
const colorDemoSelectionMultiple = ref<TreeSelectionKeys>({})

// 自定义颜色控制
const customSelectedBg = ref('#e91e63')
const customSelectedText = ref('#ffffff')
const customFocusBg = ref('#c2185b')
const customFocusText = ref('#ffffff')

// 缩进演示相关状态
const indentDemoSelection1 = ref<TreeSelectionKeys>({})
const indentDemoSelection2 = ref<TreeSelectionKeys>({})
const indentDemoSelection3 = ref<TreeSelectionKeys>({})
const indentDemoSelection4 = ref<TreeSelectionKeys>({})
const indentDemoSelection5 = ref<TreeSelectionKeys>({})

// 自定义缩进控制
const customIndent = ref(30)

// 展开状态
const draggableExpandedKeys = ref<TreeExpandedKeys>({
  'd1': true,  // 展开第一个拖拽节点
  'd2': true   // 展开第二个拖拽节点
})

// 事件日志
interface EventLogItem {
  time: string
  type: string
  message: string
  details?: {
    dragNode?: any
    dropNode?: any
    position?: string
    before?: any
    after?: any
  }
}

const eventLog = ref<EventLogItem[]>([])

// 拖拽信息
interface DragInfo {
  dragNodeInfo: {
    key: string | number
    label: string
    hasChildren: boolean
    childrenCount: number
    isLeaf: boolean
    data?: any
    [key: string]: any
  }
  dropNodeInfo: {
    key: string | number
    label: string
    hasChildren: boolean
    childrenCount: number
    isLeaf: boolean
    data?: any
    [key: string]: any
  }
  position: TreeDropPosition
  before: {
    parentLabel: string
    parentKey: string | number | null
    index: number
    level: number
    path: string
  }
  after: {
    parentLabel: string
    parentKey: string | number | null
    index: number
    level: number
    path: string
  }
}

const lastDragInfo = ref<DragInfo | null>(null)

// 基础树数据
const basicTreeData = ref<TreeNode[]>([
  {
    key: '1',
    label: '文档',
    icon: Folder,
    children: [
      {
        key: '1-1',
        label: '工作文档',
        icon: Folder,
        children: [
          { key: '1-1-1', label: '项目计划.docx', icon: File },
          { key: '1-1-2', label: '需求文档.pdf', icon: File },
        ]
      },
      {
        key: '1-2',
        label: '个人文档',
        icon: Folder,
        children: [
          { key: '1-2-1', label: '简历.pdf', icon: File },
          { key: '1-2-2', label: '笔记.md', icon: File },
        ]
      }
    ]
  },
  {
    key: '2',
    label: '图片',
    icon: Folder,
    children: [
      { key: '2-1', label: '头像.jpg', icon: File },
      { key: '2-2', label: '背景.png', icon: File },
    ]
  },
  {
    key: '3',
    label: '代码',
    icon: Folder,
    children: [
      { key: '3-1', label: 'main.ts', icon: Code },
      { key: '3-2', label: 'App.vue', icon: Code },
    ]
  }
])

// 大型树数据（用于过滤演示）
const largeTreeData = ref<TreeNode[]>(generateSampleData(50))

// 可拖拽树数据
const draggableTreeData = ref<TreeNode[]>([
  {
    key: 'd1',
    label: '可拖拽节点 1',
    draggable: true,
    children: [
      { key: 'd1-1', label: '子节点 1-1', draggable: true },
      { key: 'd1-2', label: '子节点 1-2', draggable: true },
    ]
  },
  {
    key: 'd2',
    label: '可拖拽节点 2',
    draggable: true,
    children: [
      { key: 'd2-1', label: '子节点 2-1', draggable: true },
    ]
  },
  {
    key: 'd3',
    label: '固定节点（不可拖拽）',
    draggable: false
  }
])

// 跨树拖拽数据
const crossTreeSampleData = getCrossTreeSampleData()
const crossTreeData1 = ref<TreeNode[]>(crossTreeSampleData.tree1)
const crossTreeData2 = ref<TreeNode[]>(crossTreeSampleData.tree2)

// 跨树展开状态
const crossTreeExpandedKeys1 = ref<TreeExpandedKeys>({
  'tree1-0': true,
  'tree1-0-0': true,
  'tree1-0-1': true
})

const crossTreeExpandedKeys2 = ref<TreeExpandedKeys>({
  'tree2-0': true,
  'tree2-0-0': true,
  'tree2-0-1': true
})

// 拖拽状态
const isDragging = ref(false)
const currentDragInfo = ref<{ label: string } | null>(null)
const currentHoverInfo = ref<{
  targetTreeId?: string
  dropPosition?: string
  dropNodeLabel?: string
  isCrossTree?: boolean
} | null>(null)

// 跨树拖拽信息
interface CrossTreeDragInfo {
  sourceTreeId: string
  targetTreeId: string
  dragNodeInfo: {
    key: string | number
    label: string
    hasChildren: boolean
    childrenCount: number
    isLeaf: boolean
    data?: any
    [key: string]: any
  }
  dropNodeInfo: {
    key: string | number
    label: string
    hasChildren: boolean
    childrenCount: number
    isLeaf: boolean
    data?: any
    [key: string]: any
  }
  position: TreeDropPosition
  before: {
    parentLabel: string
    parentKey: string | number | null
    index: number
    level: number
    path: string
  }
  after: {
    parentLabel: string
    parentKey: string | number | null
    index: number
    level: number
    path: string
  }
  isCrossTree: boolean
}

const lastCrossTreeDragInfo = ref<CrossTreeDragInfo | null>(null)

// 简化的跨树拖拽演示数据
const simpleTreeData1 = ref<TreeNode[]>([
  {
    key: 'simple-src-1',
    label: '源文件夹 1',
    draggable: true,
    droppable: true,
    children: [
      { key: 'simple-src-1-1', label: '文档 A.txt', draggable: true, droppable: true },
      { key: 'simple-src-1-2', label: '图片 B.jpg', draggable: true, droppable: true },
      { key: 'simple-src-1-3', label: '视频 C.mp4', draggable: true, droppable: true }
    ]
  },
  {
    key: 'simple-src-2',
    label: '源文件夹 2',
    draggable: true,
    droppable: true,
    children: [
      { key: 'simple-src-2-1', label: '代码 D.js', draggable: true, droppable: true },
      { key: 'simple-src-2-2', label: '样式 E.css', draggable: true, droppable: true }
    ]
  }
])

const simpleTreeData2 = ref<TreeNode[]>([
  {
    key: 'simple-dest-1',
    label: '目标文件夹 1',
    draggable: true,
    droppable: true,
    children: []
  },
  {
    key: 'simple-dest-2',
    label: '目标文件夹 2',
    draggable: true,
    droppable: true,
    children: []
  }
])

const simpleExpandedKeys1 = ref<TreeExpandedKeys>({
  'simple-src-1': true,
  'simple-src-2': true
})

const simpleExpandedKeys2 = ref<TreeExpandedKeys>({
  'simple-dest-1': true,
  'simple-dest-2': true
})

// 懒加载树数据
const lazyTreeData = ref<TreeNode[]>([
  {
    key: 'lazy1',
    label: '懒加载节点 1',
    lazy: true,
    children: []
  },
  {
    key: 'lazy2',
    label: '懒加载节点 2',
    lazy: true,
    children: []
  }
])

// 自定义模板树数据
const customTreeData = ref<TreeNode[]>([
  {
    key: 'users',
    label: '用户管理',
    icon: User,
    data: { count: 156 },
    children: [
      { key: 'users-1', label: '管理员', icon: Settings, data: { count: 3 } },
      { key: 'users-2', label: '普通用户', icon: User, data: { count: 153 } },
    ]
  },
  {
    key: 'database',
    label: '数据库',
    icon: Database,
    data: { count: 5 },
    children: [
      { key: 'db-1', label: '用户表', icon: Database },
      { key: 'db-2', label: '订单表', icon: Database },
    ]
  }
])

// 计算属性
const currentTheme = computed(() => {
  return availableThemes.find(theme => theme.name === selectedTheme.value)
})

// 方法
const handleThemeChange = () => {
  if (currentTheme.value) {
    applyTheme(currentTheme.value)
    addEventLog('主题切换', `切换到 ${currentTheme.value.name} 主题`)
  }
}

const toggleDarkMode = () => {
  themeToggleDarkMode()
  isDarkMode.value = !isDarkMode.value
  addEventLog('主题切换', `切换到${isDarkMode.value ? '暗色' : '亮色'}模式`)
}

const onNodeSelect = (event: any) => {
  addEventLog('节点选择', `选择节点: ${event.node.label}`)
}

const onNodeUnselect = (event: any) => {
  addEventLog('节点取消选择', `取消选择节点: ${event.node.label}`)
}

const onSelectionChange = (event: any) => {
  const selectedCount = event.value ? Object.keys(event.value).length : 0
  addEventLog('选择变更', `当前选择了 ${selectedCount} 个节点`)
}

// v-model 演示相关事件处理
const selectNode = (nodeKey: string) => {
  vModelSelection.value = { [nodeKey]: true }
  addEventLog('外部选择', `通过按钮选择节点: ${nodeKey}`)
}

const selectMultipleNodes = (nodeKeys: string[]) => {
  const selection: TreeSelectionKeys = {}
  nodeKeys.forEach(key => {
    selection[key] = true
  })
  vModelSelection.value = selection
  addEventLog('外部多选', `通过按钮选择多个节点: ${nodeKeys.join(', ')}`)
}

const clearAllSelections = () => {
  vModelSelection.value = {}
  addEventLog('外部清空', '通过按钮清空所有选择')
}

const onVModelSelectionChange = (event: any) => {
  const selectedCount = event.value ? Object.keys(event.value).length : 0
  addEventLog('v-model 选择变更', `v-model 选择变更，当前选择了 ${selectedCount} 个节点`)
}

const onNodeFocus = (event: any) => {
  currentFocusedNode.value = event.node.key
  addEventLog('节点焦点', `节点获得焦点: ${event.node.label} (${event.node.key})`)
}

const onNodeBlur = (event: any) => {
  if (currentFocusedNode.value === event.node.key) {
    currentFocusedNode.value = null
  }
  addEventLog('节点失焦', `节点失去焦点: ${event.node.label} (${event.node.key})`)
}

const onNodeClick = (event: any) => {
  addEventLog('节点点击', `点击节点: ${event.node.label} (${event.node.key})`)
}

// 键盘导航演示相关事件处理
const onKeyboardNodeFocus = (event: any) => {
  keyboardFocusedNode.value = event.node.key
  addEventLog('键盘焦点', `键盘导航焦点: ${event.node.label} (${event.node.key})`)
}

const onKeyboardNodeBlur = (event: any) => {
  if (keyboardFocusedNode.value === event.node.key) {
    keyboardFocusedNode.value = null
  }
  addEventLog('键盘失焦', `键盘导航失焦: ${event.node.label} (${event.node.key})`)
}

const onKeyboardSelectionChange = (event: any) => {
  const selectedCount = event.value ? Object.keys(event.value).length : 0
  addEventLog('键盘选择变更', `键盘导航选择变更，当前选择了 ${selectedCount} 个节点`)
}

const focusFirstNode = () => {
  if (keyboardTreeRef.value) {
    keyboardTreeRef.value.focusFirst()
    addEventLog('键盘操作', '通过按钮焦点到第一个节点')
  }
}

const focusLastNode = () => {
  if (keyboardTreeRef.value) {
    keyboardTreeRef.value.focusLast()
    addEventLog('键盘操作', '通过按钮焦点到最后一个节点')
  }
}

const clearFocus = () => {
  if (keyboardTreeRef.value) {
    keyboardTreeRef.value.clearFocus()
    addEventLog('键盘操作', '通过按钮清除焦点')
  }
}

const onFilter = (event: any) => {
  addEventLog('过滤', `过滤关键词: "${event.value}", 结果: ${event.filteredValue?.length || 0} 个节点`)
}

const onNodeDrop = (event: any) => {
  // 接受拖拽
  event.accept()
  
  // 获取拖拽前的位置信息
  const beforePosition = getNodePosition(draggableTreeData.value, event.dragNode.key)
  const dropNodePosition = getNodePosition(draggableTreeData.value, event.dropNode.key)
  
  // 保存当前的展开状态
  const currentExpandedKeys = { ...draggableExpandedKeys.value }
  
  // 更新树数据
  const updatedData = moveTreeNode(
    draggableTreeData.value,
    event.dragNode.key,
    event.dropNode.key,
    event.dropPosition
  )
  
  // 先清空展开状态，强制 Tree 组件重新同步
  draggableExpandedKeys.value = {}
  
  // 更新响应式数据
  draggableTreeData.value = updatedData
  
  // 格式化拖拽信息
  const dragInfo = formatDragInfo(
    event.dragNode,
    event.dropNode,
    event.dropPosition,
    beforePosition,
    dropNodePosition
  )
  
  // 保存拖拽信息
  lastDragInfo.value = dragInfo
  
  // 使用 nextTick 确保在下一个 tick 中恢复展开状态
  nextTick(() => {
    // 恢复展开状态
    const newExpandedKeys = { ...currentExpandedKeys }
    
    // 确保目标节点展开（如果拖拽到内部）
    if (event.dropPosition === 'inside' && event.dropNode.children) {
      newExpandedKeys[event.dropNode.key] = true
    }
    
    // 设置新的展开状态
    draggableExpandedKeys.value = newExpandedKeys
  })
  
  // 添加详细的拖拽日志
  const simpleMessage = `拖拽 "${dragInfo.dragNodeInfo.label}" 到 "${dragInfo.dropNodeInfo.label}" (${dragInfo.position})`
  
  addEventLog('拖拽详情', simpleMessage, {
    dragNode: dragInfo.dragNodeInfo,
    dropNode: dragInfo.dropNodeInfo,
    position: dragInfo.position,
    before: dragInfo.before,
    after: dragInfo.after
  })
}

// 简化的跨树移动处理
const onCrossTreeMove = (event: any) => {
  console.log('🎯 跨树移动事件:', {
    dragNode: event.dragNode.label,
    dropNode: event.dropNode.label,
    dropPosition: event.dropPosition,
    sourceTreeId: event.sourceTreeId,
    targetTreeId: event.targetTreeId
  })
  
  // 显示成功消息
  console.log(`✅ 成功将 "${event.dragNode.label}" 从 ${event.sourceTreeId} 移动到 ${event.targetTreeId}`)
}



// 跨树拖拽自动更新演示方法
// 简化的跨树移动事件处理
const onSimpleCrossTreeMove = (event: any) => {
  console.log('✅ 简化跨树移动事件:', event)
  addEventLog('跨树移动', `${event.dragNode.label} 移动到 ${event.dropNode.label}`, {
    dragNode: event.dragNode,
    dropNode: event.dropNode,
    dropPosition: event.dropPosition
  })
}

// 重置简化演示数据
const resetSimpleDemo = () => {
  simpleTreeData1.value = [
    {
      key: 'simple-src-1',
      label: '源文件夹 1',
      draggable: true,
      droppable: true,
      children: [
        { key: 'simple-src-1-1', label: '文档 A.txt', draggable: true, droppable: true },
        { key: 'simple-src-1-2', label: '图片 B.jpg', draggable: true, droppable: true },
        { key: 'simple-src-1-3', label: '视频 C.mp4', draggable: true, droppable: true }
      ]
    },
    {
      key: 'simple-src-2',
      label: '源文件夹 2',
      draggable: true,
      droppable: true,
      children: [
        { key: 'simple-src-2-1', label: '代码 D.js', draggable: true, droppable: true },
        { key: 'simple-src-2-2', label: '样式 E.css', draggable: true, droppable: true }
      ]
    }
  ]
  
  simpleTreeData2.value = [
    {
      key: 'simple-dest-1',
      label: '目标文件夹 1',
      draggable: true,
      droppable: true,
      children: []
    },
    {
      key: 'simple-dest-2',
      label: '目标文件夹 2',
      draggable: true,
      droppable: true,
      children: []
    }
  ]
  
  addEventLog('重置演示', '简化演示数据已重置')
}

// 测试简化跨树拖拽功能
const testSimpleCrossTreeDrag = () => {
  console.log('🧪 开始测试简化跨树拖拽功能')
  
  // 查找源节点 - 从第一个树的第一个子节点
  const sourceNode = simpleTreeData1.value[0]?.children?.[0]
  const targetNode = simpleTreeData2.value[0]
  
  if (!sourceNode || !targetNode) {
    console.error('❌ 找不到源节点或目标节点')
    addEventLog('测试失败', '找不到源节点或目标节点')
    return
  }
  
  console.log('✅ 找到源节点:', sourceNode)
  console.log('✅ 找到目标节点:', targetNode)
  
  // 模拟跨树拖拽事件
  const mockEvent = {
    originalEvent: new Event('drop'),
    dragNode: sourceNode,
    dropNode: targetNode,
    dropPosition: 'inside' as const,
    sourceTreeId: 'simple-tree1',
    targetTreeId: 'simple-tree2',
    isCrossTree: true
  }
  
  console.log('🚀 触发简化跨树拖拽事件:', mockEvent)
  onSimpleCrossTreeMove(mockEvent)
  addEventLog('测试拖拽', `模拟拖拽: ${sourceNode.label} → ${targetNode.label}`)
}



// 测试跨树拖拽功能
const testCrossTreeDrag = () => {
  console.log('🧪 开始测试跨树拖拽功能')
  
  // 先打印所有可用的节点 key
  console.log('🔍 crossTreeData1 节点:', crossTreeData1.value)
  console.log('🔍 crossTreeData2 节点:', crossTreeData2.value)
  
  // 查找源节点 - 使用一个肯定存在的节点 (tree1-0-0-0)
  let sourceNode = findTreeNode(crossTreeData1.value, 'tree1-0-0-0')
  if (!sourceNode) {
    console.error('❌ 找不到源节点 tree1-0-0-0')
    // 尝试查找其他可用的节点
    const firstNode = crossTreeData1.value[0]
    if (firstNode && firstNode.children && firstNode.children[0] && firstNode.children[0].children && firstNode.children[0].children[0]) {
      sourceNode = firstNode.children[0].children[0]
      console.log('🔄 使用第一个可用节点:', sourceNode)
    } else {
      console.error('❌ 无法找到任何可用的源节点')
      return
    }
  }
  
  // 查找目标节点 (tree2 的根节点)
  const targetNode = crossTreeData2.value[0]
  if (!targetNode) {
    console.error('❌ 找不到目标节点')
    return
  }
  
  console.log('✅ 找到源节点:', sourceNode)
  console.log('✅ 找到目标节点:', targetNode)
  
  // 模拟跨树拖拽事件
  const mockEvent = {
    originalEvent: new Event('drop'),
    dragNode: sourceNode,
    dropNode: targetNode,
    dropIndex: 0,
    dropPosition: 'inside' as const,
    sourceTreeId: 'tree1',
    targetTreeId: 'tree2',
    isCrossTree: true,
    accept: () => {
      console.log('✅ 跨树拖拽被接受')
    }
  }
  
  console.log('🚀 触发跨树拖拽事件:', mockEvent)
  onCrossTreeMove(mockEvent)
}

// 真实拖拽测试 - 检查DOM元素是否真的可拖拽
const testRealDrag = () => {
  console.log('🔥🔥🔥 开始真实拖拽测试！')
  
  // 查找第一个跨树节点的DOM元素
  const sourceElement = document.querySelector('[data-node-key="tree1-0-0-0"]')
  const targetElement = document.querySelector('[data-node-key="tree2-0"]')
  
  console.log('🔍 源元素:', sourceElement)
  console.log('🔍 目标元素:', targetElement)
  
  if (!sourceElement || !targetElement) {
    console.error('❌ 找不到DOM元素！')
    return
  }
  
  // 检查draggable属性
  const contentElement = sourceElement.querySelector('.p-tree-node-content')
  console.log('🔍 内容元素:', contentElement)
  console.log('🔍 draggable属性:', contentElement?.getAttribute('draggable'))
  console.log('🔍 类名:', contentElement?.className)
  
  // 找到源节点数据
  const sourceNode = findTreeNode(crossTreeData1.value, 'tree1-0-0-0')
  if (!sourceNode) {
    console.error('❌ 找不到源节点数据！')
    return
  }
  console.log('✅ 找到源节点数据:', sourceNode)
  
  // 直接调用跨树拖拽函数，绕过DOM事件
  const targetNode = findTreeNode(crossTreeData2.value, 'tree2-0')
  if (!targetNode) {
    console.error('❌ 找不到目标节点数据！')
    return
  }
  console.log('✅ 找到目标节点数据:', targetNode)
  
  // 创建拖拽事件对象
  const mockDragEvent = {
    originalEvent: new Event('drop'),
    dragNode: sourceNode,
    dropNode: targetNode,
    dropIndex: 0,
    dropPosition: 'inside' as const,
    sourceTreeId: 'tree1',
    targetTreeId: 'tree2',
    isCrossTree: true,
    accept: () => {
      console.log('✅ 真实拖拽测试被接受！')
    }
  }
  
  console.log('🚀 直接调用跨树拖拽函数:', mockDragEvent)
  onCrossTreeMove(mockDragEvent)
}

// 测试新插入节点的拖拽功能
const testNewNodeDrag = () => {
  console.log('🧪🧪🧪 开始测试新插入节点的拖拽功能！')
  
  // 首先执行一次跨树拖拽，确保有新插入的节点
  testCrossTreeDrag()
  
  // 等待一段时间让DOM更新
  setTimeout(() => {
    console.log('🔍 查找新插入的节点...')
    
    // 查找新插入的节点（应该在tree2中，key为tree1-0）
    const newNodeElement = document.querySelector('[data-tree-id="tree2"] [data-node-key="tree1-0"]')
    console.log('🔍 新插入的节点元素:', newNodeElement)
    
    if (!newNodeElement) {
      console.error('❌ 找不到新插入的节点！')
      return
    }
    
    const contentElement = newNodeElement.querySelector('.p-tree-node-content')
    console.log('🔍 新节点内容元素:', contentElement)
    console.log('🔍 新节点draggable属性:', contentElement?.getAttribute('draggable'))
    console.log('🔍 新节点类名:', contentElement?.className)
    
    // 尝试触发拖拽开始事件
    if (contentElement) {
      console.log('🎯 尝试触发新节点的拖拽开始事件...')
      
      // 创建拖拽开始事件
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      })
      
      console.log('🚀 触发dragstart事件:', dragStartEvent)
      contentElement.dispatchEvent(dragStartEvent)
      
      // 检查是否有handleDragStart被调用的日志
      setTimeout(() => {
        console.log('🔍 检查拖拽开始事件是否被正确处理...')
      }, 100)
    }
  }, 1000)
}

// 自动执行真实拖拽测试
const autoTestRealDrag = () => {
  console.log('🤖 自动执行真实拖拽测试...')
  setTimeout(() => {
    testRealDrag()
  }, 1000)
}

// 重置跨树数据
const resetCrossTreeData = () => {
  console.log('🔄 重置跨树数据')
  const freshData = getCrossTreeSampleData()
  crossTreeData1.value = freshData.tree1
  crossTreeData2.value = freshData.tree2
  lastCrossTreeDragInfo.value = null
  
  addEventLog('数据重置', '跨树数据已重置为初始状态')
}

// 查看当前数据状态
const logCurrentData = () => {
  console.log('📊 当前数据状态:')
  console.log('🌳 Tree1 数据:', JSON.stringify(crossTreeData1.value, null, 2))
  console.log('🌳 Tree2 数据:', JSON.stringify(crossTreeData2.value, null, 2))
  
  // 统计节点数量
  const countNodes = (nodes) => {
    let count = 0
    const traverse = (nodeList) => {
      nodeList.forEach(node => {
        count++
        if (node.children) {
          traverse(node.children)
        }
      })
    }
    traverse(nodes)
    return count
  }
  
  const tree1Count = countNodes(crossTreeData1.value)
  const tree2Count = countNodes(crossTreeData2.value)
  
  console.log(`📈 Tree1 节点数量: ${tree1Count}`)
  console.log(`📈 Tree2 节点数量: ${tree2Count}`)
  
  addEventLog('数据查看', `Tree1: ${tree1Count}个节点, Tree2: ${tree2Count}个节点`)
}

// 完整功能测试
const runFullTest = async () => {
  console.log('🚀🚀🚀 开始完整功能测试！')
  addEventLog('完整测试', '开始跨树拖拽完整功能测试')
  
  // 1. 重置数据
  console.log('📋 步骤1: 重置数据')
  resetCrossTreeData()
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 2. 查看初始数据
  console.log('📋 步骤2: 查看初始数据')
  logCurrentData()
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 3. 测试跨树拖拽
  console.log('📋 步骤3: 执行跨树拖拽测试')
  testCrossTreeDrag()
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 4. 查看拖拽后数据
  console.log('📋 步骤4: 查看拖拽后数据')
  logCurrentData()
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 5. 测试真实拖拽
  console.log('📋 步骤5: 执行真实拖拽测试')
  testRealDrag()
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 6. 最终数据验证
  console.log('📋 步骤6: 最终数据验证')
  logCurrentData()
  
  console.log('✅✅✅ 完整功能测试完成！')
  addEventLog('测试完成', '跨树拖拽完整功能测试已完成')
}

const onNodeExpand = (event: any) => {
  const node = event.node
  
  // 模拟异步加载
  setTimeout(() => {
    if (node.children.length === 0) {
      // 添加子节点
      const childCount = Math.floor(Math.random() * 3) + 1
      for (let i = 1; i <= childCount; i++) {
        node.children.push({
          key: `${node.key}-${i}`,
          label: `动态子节点 ${i}`,
          icon: File
        })
      }
    }
    node.loading = false
    addEventLog('懒加载', `为节点 "${node.label}" 加载了 ${node.children.length} 个子节点`)
  }, 1000)
  
  addEventLog('节点展开', `展开节点: ${node.label}`)
}

const getNodeIcon = (node: TreeNode) => {
  return node.icon || File
}

const addEventLog = (type: string, message: string, details?: any) => {
  const now = new Date()
  const time = now.toLocaleTimeString()
  
  eventLog.value.unshift({
    time,
    type,
    message,
    details
  })
  
  // 限制日志数量
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50)
  }
}

// 自动测试拖拽功能
const autoTestDrag = () => {
  console.log('🧪 开始自动测试拖拽功能...')
  
  // 等待DOM完全渲染
  nextTick(() => {
    // 查找第一个可拖拽的节点
    const sourceNode = document.querySelector('[data-tree-id="tree1"] .p-tree-node-draggable')
    const targetNode = document.querySelector('[data-tree-id="tree2"] .p-tree-node-droppable')
    
    if (sourceNode && targetNode) {
      console.log('🎯 找到源节点和目标节点，开始模拟拖拽...')
      console.log('源节点:', sourceNode)
      console.log('目标节点:', targetNode)
      
      // 模拟拖拽开始
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      })
      
      console.log('🚀 触发 dragstart 事件...')
      sourceNode.dispatchEvent(dragStartEvent)
      
      // 等待一下，然后模拟拖拽悬停
      setTimeout(() => {
        const dragOverEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer()
        })
        
        console.log('🎯 触发 dragover 事件...')
        targetNode.dispatchEvent(dragOverEvent)
      }, 100)
      
    } else {
      console.log('❌ 未找到可拖拽的节点')
      console.log('源节点:', sourceNode)
      console.log('目标节点:', targetNode)
    }
  })
}

// 生命周期钩子
onMounted(() => {
  console.log('🌳 TreeDemo mounted - 组件已挂载')
  
  // 等待组件完全渲染后测试拖拽
  setTimeout(() => {
    testDragFunctionality()
  }, 2000)
})

const testDragFunctionality = () => {
  console.log('🧪 开始测试跨树拖拽功能...')
  
  // 查找跨树拖拽的源节点 (tree1)
  const sourceNode = document.querySelector('[data-tree-id="tree1"] [draggable="true"]')
  if (!sourceNode) {
    console.error('❌ 未找到tree1中的可拖拽节点')
    return
  }
  
  console.log('✅ 找到tree1中的可拖拽节点:', sourceNode.textContent?.trim())
  console.log('✅ 节点的draggable属性:', sourceNode.getAttribute('draggable'))
  
  // 创建拖拽事件
  const dragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
    dataTransfer: new DataTransfer()
  })
  
  console.log('🚀 触发dragstart事件...')
  sourceNode.dispatchEvent(dragStartEvent)
  
  // 查找目标节点 (tree2)
  setTimeout(() => {
    const targetNodes = document.querySelectorAll('[data-tree-id="tree2"] [draggable="true"]')
    if (targetNodes.length > 0) {
      const targetNode = targetNodes[0]
      console.log('🎯 找到tree2中的目标节点:', targetNode.textContent?.trim())
      
      // 创建dragover事件
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dragStartEvent.dataTransfer
      })
      
      console.log('🔥 触发dragover事件...')
      targetNode.dispatchEvent(dragOverEvent)
      
      // 测试完整的拖拽流程，包括drop事件
      setTimeout(() => {
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dragStartEvent.dataTransfer
        })
        
        console.log('💧 触发drop事件...')
        targetNode.dispatchEvent(dropEvent)
        
        // 触发dragend事件
        setTimeout(() => {
          const dragEndEvent = new DragEvent('dragend', {
            bubbles: true,
            cancelable: true,
            dataTransfer: dragStartEvent.dataTransfer
          })
          
          console.log('🏁 触发dragend事件...')
          sourceNode.dispatchEvent(dragEndEvent)
        }, 200)
      }, 500)
    } else {
      console.error('❌ 未找到tree2中的目标节点')
    }
  }, 500)
}

const clearEventLog = () => {
  eventLog.value = []
}
</script>

<style scoped>
.tree-demo {
  @apply max-w-7xl mx-auto p-6 space-y-8;
}

.demo-header {
  @apply text-center mb-8;
}

.demo-title {
  @apply text-3xl font-bold text-gray-900 mb-4;
}

.demo-description {
  @apply text-lg text-gray-600 max-w-3xl mx-auto;
}

.theme-selector {
  @apply flex items-center justify-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg;
}

.theme-label {
  @apply font-medium text-gray-700;
}

.theme-select {
  @apply px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.theme-toggle {
  @apply flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors;
}

.demo-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.demo-section {
  @apply space-y-4;
}

.demo-section.full-width {
  @apply lg:col-span-2;
}

.section-title {
  @apply text-xl font-semibold text-gray-800;
}

.demo-card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}

.demo-tree {
  @apply h-64 overflow-auto;
}

.selection-info {
  @apply mt-4 p-3 bg-blue-50 rounded-md text-sm;
}

.drag-info,
.lazy-info {
  @apply mt-4 p-3 bg-gray-50 rounded-md;
}

.custom-node {
  @apply flex items-center gap-2;
}

.node-icon {
  @apply text-blue-600;
}

.node-label {
  @apply flex-1;
}

.node-badge {
  @apply px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full;
}

.event-log {
  @apply border border-gray-200 rounded-lg overflow-hidden;
}

.log-header {
  @apply flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200;
}

.clear-btn {
  @apply flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors;
}

.log-content {
  @apply max-h-64 overflow-auto;
}

.log-item {
  @apply border-b border-gray-100 last:border-b-0 text-sm;
}

.log-item-detailed {
  @apply border border-gray-200 rounded-lg mb-3 last:mb-0;
}

.log-header-row {
  @apply flex items-center gap-4 p-3;
}

.log-details {
  @apply px-3 pb-3 border-t border-gray-100 bg-gray-50;
}

.log-time {
  @apply text-gray-500 font-mono;
}

.log-type {
  @apply px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium;
}

.log-message {
  @apply flex-1 text-gray-700;
}

.log-empty {
  @apply p-8 text-center text-gray-500;
}

/* 详细信息样式 */
.detail-section {
  @apply mb-4 last:mb-0;
}

.detail-title {
  @apply text-sm font-medium text-gray-800 mb-2 pb-1 border-b border-gray-200;
}

.detail-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-2;
}

.detail-item {
  @apply flex flex-col;
}

.detail-label {
  @apply text-xs text-gray-500;
}

.detail-value {
  @apply text-sm font-medium text-gray-800;
}

/* 位置比较样式 */
.position-comparison {
  @apply flex items-center gap-4;
}

.position-before,
.position-after {
  @apply flex-1;
}

.position-subtitle {
  @apply text-xs font-medium text-gray-600 mb-2;
}

.position-info {
  @apply space-y-1;
}

.position-detail {
  @apply flex justify-between items-center;
}

.position-label {
  @apply text-xs text-gray-500;
}

.position-value {
  @apply text-xs font-medium text-gray-800;
}

.position-arrow {
  @apply text-lg text-gray-400 font-bold;
}

/* 节点属性样式 */
.node-properties {
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}

.node-property-group {
  @apply border border-gray-200 rounded p-2;
}

.property-group-title {
  @apply text-xs font-medium text-gray-600 mb-2 pb-1 border-b border-gray-200;
}

.property-list {
  @apply space-y-1;
}

.property-item {
  @apply flex justify-between items-center;
}

.property-label {
  @apply text-xs text-gray-500;
}

.property-value {
  @apply text-xs font-medium text-gray-800;
}

.no-drag-info {
  @apply border-2 border-dashed border-gray-200 rounded-lg;
}

/* 颜色控制样式 */
.color-controls {
  @apply space-y-3;
}

.control-group {
  @apply flex items-center gap-3;
}

.control-label {
  @apply text-sm font-medium text-gray-700 min-w-24;
}

.color-input {
  @apply w-12 h-8 border border-gray-300 rounded cursor-pointer;
}

.color-value {
  @apply text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded;
}

/* 缩进控制样式 */
.indent-controls {
  @apply space-y-3;
}

.indent-slider {
  @apply flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer;
}

.indent-slider::-webkit-slider-thumb {
  @apply appearance-none w-5 h-5 bg-blue-500 rounded-full cursor-pointer;
}

.indent-slider::-moz-range-thumb {
  @apply w-5 h-5 bg-blue-500 rounded-full cursor-pointer border-0;
}

.indent-value {
  @apply text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded min-w-16 text-center;
}

/* 缩进对比样式 */
.indent-comparison {
  @apply space-y-4;
}

.comparison-item {
  @apply border border-gray-200 rounded-lg p-3;
}

.demo-tree.compact {
  @apply text-sm;
}

.demo-tree.spacious {
  @apply text-base;
}

/* 拖拽状态指示器样式 */
.drag-status-indicator {
  @apply bg-blue-50 border-blue-200 border-2;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% {
    border-color: rgb(147 197 253);
  }
  50% {
    border-color: rgb(59 130 246);
  }
}

/* 自动更新演示样式 */
.form-checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.control-group {
  @apply border border-gray-200 rounded-lg p-4;
}

.pending-operation {
  @apply flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg;
}

.operation-info {
  @apply flex-1;
}

.operation-actions {
  @apply flex gap-2;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .demo-title {
    @apply text-white;
  }
  
  .demo-description {
    @apply text-gray-300;
  }
  
  .theme-selector {
    @apply bg-gray-800;
  }
  
  .theme-label {
    @apply text-gray-300;
  }
  
  .section-title {
    @apply text-gray-200;
  }
  
  .demo-card {
    @apply bg-gray-800 border-gray-700;
  }
}
</style>