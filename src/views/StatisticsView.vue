<template>
  <div class="statistics-view">
    <h2 class="page-title">线路统计</h2>
    
    <div class="statistics-layout">
      <!-- 左侧筛选面板 -->
      <div class="filter-sidebar">
        <filter-panel 
          :data="currentYearData" 
          @filter-changed="handleFilterChange"
          class="filter-panel"
        />
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="content-area">
        <statistics-chart
          :data="processedData"
          :loading="loading"
          :has-data="hasData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import FilterPanel from '@/components/FilterPanel.vue'
import StatisticsChart from '@/components/StatisticsChart.vue'

const store = useStore()
const loading = ref(false)
const filters = ref({})

const currentYear = computed(() => store.state.data.currentYear)
const currentYearData = computed(() => 
  currentYear.value === 2025 ? store.state.data.data2025 : store.state.data.data2026
)

const hasData = computed(() => currentYearData.value.length > 0)

// 处理数据，增强连线信息处理
const processedData = computed(() => {
  if (!hasData.value) return { nodes: [], links: [] }

  const filteredData = currentYearData.value.filter(item => {
    for (const key in filters.value) {
      if (Array.isArray(filters.value[key]) && filters.value[key].length > 0) {
        if (!filters.value[key].includes(item[key])) {
          return false
        }
      }
    }
    return true
  })

  // 构建连接关系映射
  const connectionMap = new Map()
  filteredData.forEach(item => {
    const key = `${item.local}-${item.remote}`
    if (!connectionMap.has(key)) {
      connectionMap.set(key, [])
    }
    connectionMap.get(key).push(item)
  })

  const nodes = []
  const links = []
  const nodeMap = new Map()

  // 处理节点
  connectionMap.forEach((connections, key) => {
    const [local, remote] = key.split('-')

    // 添加本端节点
    if (!nodeMap.has(local)) {
      nodeMap.set(local, nodes.length)
      nodes.push({
        id: nodes.length,
        name: local,
        value: 1,
        category: 0,
        symbolSize: 50,
        draggable: true,
        fixed: false
      })
    }

    // 添加对端节点
    if (!nodeMap.has(remote)) {
      nodeMap.set(remote, nodes.length)
      nodes.push({
        id: nodes.length,
        name: remote,
        value: 1,
        category: 1,
        symbolSize: 40,
        draggable: true,
        fixed: false
      })
    }

    // 为每条连接创建一条线
    connections.forEach((connection, index) => {
      links.push({
        source: nodeMap.get(local),
        target: nodeMap.get(remote),
        lineInfo: connection,
        connectionIndex: index,
        totalConnections: connections.length
      })
    })
  })

  return { nodes, links }
})

const handleFilterChange = (newFilters) => {
  filters.value = newFilters
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}
</script>

<style scoped>
.statistics-view {
  padding: 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1e293b;
}

.statistics-layout {
  display: flex;
  gap: 24px;
  flex: 1;
  overflow: hidden;
}

.filter-sidebar {
  width: 320px;
  flex-shrink: 0;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.filter-panel {
  padding: 20px;
}

.content-area {
  flex: 1;
  min-width: 0;
  height: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

@media (max-width: 1024px) {
  .statistics-layout {
    flex-direction: column;
  }

  .filter-sidebar {
    width: 100%;
  }
}
</style>