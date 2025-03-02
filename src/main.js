import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/styles/main.css'
import './utils/chartConfig.js'

createApp(App).use(store).use(router).mount('#app')