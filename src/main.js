import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 确保已经引入了必要的 ECharts 组件
import VChart from 'vue-echarts'

const app = createApp(App)

// 注册 VChart 组件
app.component('v-chart', VChart)

app.use(router)
app.use(store)
app.mount('#app')