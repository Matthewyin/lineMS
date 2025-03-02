<template>
  <div class="statistics-chart-container">
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    <div v-else-if="!hasData" class="chart-no-data">
      <span>暂无数据</span>
    </div>
    <div v-else class="chart-wrapper">
      <v-chart class="chart" :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GraphChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  GraphChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent
])

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasData: {
    type: Boolean,
    default: false
  }
})

// 图表配置
const chartOption = computed(() => {
  if (!props.hasData) return {}

  return {
    title: {
      text: '线路拓扑关系图',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'node') {
          return `${params.name}`
        }
        return `${params.data.source} -> ${params.data.target}`
      }
    },
    legend: {
      data: ['本端', '对端'],
      orient: 'horizontal',
      bottom: 10,
      left: 'center'
    },
    toolbox: {
      feature: {
        restore: {},
        saveAsImage: {}
      }
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      name: '线路拓扑',
      type: 'graph',
      layout: 'force',
      data: props.data.nodes,
      links: props.data.links,
      categories: [
        { name: '本端' },
        { name: '对端' }
      ],
      roam: true,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      force: {
        repulsion: 1000,
        edgeLength: 200
      },
      lineStyle: {
        color: '#4f46e5',
        width: 2,
        curveness: 0.3
      },
      itemStyle: {
        color: function(params) {
          // 本端节点使用深蓝色，对端节点使用绿色
          return params.data.category === 0 ? '#4f46e5' : '#22c55e'
        }
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 4
        }
      }
    }]
  }
})
</script>

<style scoped>
.statistics-chart-container {
  position: relative;
  height: 600px;
  width: 100%;
}

.chart-wrapper {
  height: 100%;
  width: 100%;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-loading,
.chart-no-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--background);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>