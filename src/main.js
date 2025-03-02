import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles/main.css'
// 重新引入Chart.js全局配置，为数据对比功能提供支持
import './utils/chartConfig.js'

createApp(App).use(store).use(router).mount('#app')