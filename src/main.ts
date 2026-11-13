import { createApp } from 'vue'
import { initializeDarkMode } from '@/utils/dark-mode'
import App from './App.vue'
import router from './router'
// import { store } from './store'
import pinia from '@/store';
// normalize.css
import 'normalize.css/normalize.css'
// 全局样式
import './styles/index.less'
// tailwindcss
import './styles/tailwind.css'
// svg icon
import 'virtual:svg-icons/register'
import 'vant/lib/index.css';

// eruda 移动端调试工具（仅开发环境）
// if (import.meta.env.VITE_ENABLE_ERUDA === 'true') {
//   const script = document.createElement('script')
//   script.src = '//cdn.jsdelivr.net/npm/eruda'
//   script.onload = () => (window as any).eruda?.init()
//   document.head.appendChild(script)
// }

initializeDarkMode()

const app = createApp(App)
// app.use(store)
app.use(pinia)
app.use(router)

app.mount('#app')
