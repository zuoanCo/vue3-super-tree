import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { TreePlugin } from './lib'

// 创建Vue应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 使用 Tree 插件
app.use(TreePlugin, {
  prefix: 'P',
  globalComponents: true,
  defaultTheme: 'lara-light',
  autoSystemTheme: false
})

// 挂载应用
app.mount('#app')
