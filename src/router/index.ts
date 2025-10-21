import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import TreeDemo from '@/pages/TreeDemo.vue'
import UserTreeExample from '@/pages/UserTreeExample.vue'
import AutoUpdateExample from '@/pages/AutoUpdateExample.vue'
import CrossTreeAutoUpdateTest from '@/pages/CrossTreeAutoUpdateTest.vue'
import SimpleAutoUpdateDemo from '@/pages/SimpleAutoUpdateDemo.vue'
import SimpleDragDemo from '@/pages/SimpleDragDemo.vue'
import QuickTest from '@/pages/QuickTest.vue'
import CrossTreeDragDiagnosis from '@/pages/CrossTreeDragDiagnosis.vue'
import CrossTreeDragDemo from '@/pages/CrossTreeDragDemo.vue'
import ConfigTest from '@/pages/ConfigTest.vue'
import DragTestPage from '@/pages/DragTestPage.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/demo',
    name: 'demo',
    component: TreeDemo,
  },
  {
    path: '/example',
    name: 'example',
    component: UserTreeExample,
  },
  {
    path: '/auto-update',
    name: 'auto-update',
    component: AutoUpdateExample,
  },
  {
    path: '/cross-tree-test',
    name: 'cross-tree-test',
    component: CrossTreeAutoUpdateTest,
  },
  {
    path: '/simple-demo',
    name: 'simple-demo',
    component: SimpleAutoUpdateDemo,
  },
  {
    path: '/simple-drag-demo',
    name: 'simple-drag-demo',
    component: SimpleDragDemo,
  },
  {
    path: '/quick-test',
    name: 'quick-test',
    component: QuickTest,
  },
  {
    path: '/diagnosis',
    name: 'diagnosis',
    component: CrossTreeDragDiagnosis,
  },
  {
    path: '/cross-tree-demo',
    name: 'cross-tree-demo',
    component: CrossTreeDragDemo,
  },
  {
    path: '/config-test',
    name: 'config-test',
    component: ConfigTest,
  },
  {
    path: '/drag-test',
    name: 'drag-test',
    component: DragTestPage,
  },
  {
    path: '/about',
    name: 'about',
    component: {
      template: '<div class="text-center text-xl p-8">About Page - Coming Soon</div>',
    },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
