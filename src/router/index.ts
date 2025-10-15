import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import TreeDemo from '@/pages/TreeDemo.vue'
import UserTreeExample from '@/pages/UserTreeExample.vue'
import AutoUpdateExample from '@/pages/AutoUpdateExample.vue'

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
