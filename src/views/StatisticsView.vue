<template>
    <div class="statistics-view">
      <h2 class="page-title">线路统计</h2>
      
      <div class="statistics-layout">
        <!-- 左侧筛选面板 -->
        <div class="filter-sidebar">
          <filter-panel 
            :data="currentYearData" 
            @filter-changed="handleFilterChange"
          />
        </div>
        
        <!-- 右侧内容区域 -->
        <div class="content-area">
          <div class="statistics-panel card">
            <statistics-chart
              :data="processedData"
              :loading="loading"
              :has-data="hasData"
            />
          </div>
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
  
  // 从 store 获取当前年份的数据
  const currentYear = computed(() => store.state.data.currentYear)
  const currentYearData = computed(() => 
    currentYear.value === 2025 ? store.state.data.data2025 : store.state.data.data2026
  )
  
  // 判断是否有数据
  const hasData = computed(() => currentYearData.value.length > 0)
  
  // 处理数据，构建拓扑图所需的数据结构
  const processedData = computed(() => {
    if (!hasData.value) return { nodes: [], links: [] }
  
    // 按 local_line_number 分组
    const groupedData = {}
    currentYearData.value.forEach(item => {
      if (!groupedData[item.local_line_number]) {
        groupedData[item.local_line_number] = {
          local: item.local,
          remotes: new Set()
        }
      }
      if (item.remote) {
        groupedData[item.local_line_number].remotes.add(item.remote)
      }
    })
  
    // 构建节点和连接
    const nodes = []
    const links = []
    const nodeMap = new Map()
  
    // 处理节点
    Object.values(groupedData).forEach(group => {
      // 添加本端节点
      if (!nodeMap.has(group.local)) {
        nodeMap.set(group.local, nodes.length)
        nodes.push({
          id: nodes.length,
          name: group.local,
          value: 1,
          category: 0, // 本端节点类别
          symbolSize: 50 // 节点大小
        })
      }
  
      // 添加对端节点
      group.remotes.forEach(remote => {
        if (!nodeMap.has(remote)) {
          nodeMap.set(remote, nodes.length)
          nodes.push({
            id: nodes.length,
            name: remote,
            value: 1,
            category: 1, // 对端节点类别
            symbolSize: 40
          })
        }
  
        // 添加连接
        links.push({
          source: nodeMap.get(group.local),
          target: nodeMap.get(remote)
        })
      })
    })
  
    return { nodes, links }
  })
  
  // 处理筛选变化
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
  }
  
  .page-title {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 24px;
    color: var(--text-primary);
  }
  
  .statistics-layout {
    display: flex;
    gap: 24px;
  }
  
  .filter-sidebar {
    width: 300px;
    flex-shrink: 0;
  }
  
  .content-area {
    flex: 1;
    min-width: 0;
  }
  
  .statistics-panel {
    padding: 20px;
    background-color: var(--surface);
    border-radius: 8px;
    box-shadow: 0 2px 8px var(--shadow-color);
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