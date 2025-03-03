<template>
  <div class="statistics-chart-container" ref="chartContainer">
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>
    <div v-else-if="!hasData" class="chart-no-data">
      <span>暂无数据</span>
    </div>
    <div v-else class="chart-wrapper">
      <v-chart 
        class="chart" 
        :option="chartOption" 
        autoresize 
        @click="handleChartClick"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, ref } from 'vue'
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

const chartContainer = ref(null)

// 定义线路类型的颜色映射 - 使用柔和的色调
const LINE_TYPE_COLORS = {
  'MSTP': '#4573d0',           // 蓝色
  'MPLS VPN': '#67c23a',       // 绿色
  '互联网专线': '#ff9f7f',     // 珊瑚色
  '裸光纤': '#37a2ff',         // 亮蓝色
  'SDH': '#ff7b7b',           // 粉红色
  'PON': '#4ecbb4',           // 青绿色
  '同城专线': '#9287e7',       // 紫色
  '长途专线': '#fb7293',       // 玫瑰色
  'BGP': '#7fd3ff',           // 天蓝色
  '本地互联网': '#ffb980',     // 橙色
  '其他': '#c4ccd3'            // 灰色
}

// 定义节点颜色
const NODE_COLORS = {
  local: '#67c23a',    // 本端节点颜色 - 绿色
  remote: '#4573d0'    // 对端节点颜色 - 蓝色
}

// 格式化线路信息
const formatLineInfo = (info) => {
  if (!info) return ''
  
  const excludeKeys = ['id', 'created_at', 'updated_at']
  const lines = []
  
  for (const [key, value] of Object.entries(info)) {
    if (!excludeKeys.includes(key) && value !== null && value !== undefined) {
      lines.push(`<strong>${key}</strong>: ${value}`)
    }
  }
  
  return `<div style="max-width: 300px; padding: 8px;">${lines.join('<br/>')}</div>`
}

// 计算连线的曲度
const calculateCurveness = (index, total) => {
  if (total === 1) return 0.2
  const baseStep = 0.15
  const offset = (index - (total - 1) / 2) * baseStep
  return 0.2 + offset
}

// 处理全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    chartContainer.value.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 获取线路类型的图例数据
const getLineTypeLegend = computed(() => {
  if (!props.hasData) return []
  const types = new Set()
  props.data.links.forEach(link => {
    if (link.lineInfo && link.lineInfo.line_type) {
      types.add(link.lineInfo.line_type)
    }
  })
  return Array.from(types)
})

// 图表配置
const chartOption = computed(() => {
  if (!props.hasData) return {}

  const lineTypes = getLineTypeLegend.value

  return {
    backgroundColor: '#ffffff',
    title: {
      text: '线路拓扑关系图',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 18,
        fontWeight: 'normal',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'node') {
          const nodeType = params.data.category === 0 ? '本端' : '对端'
          return `<div style="font-weight: bold; color: #333;">
                    ${nodeType}: ${params.name}
                 </div>`
        }
        return formatLineInfo(params.data.lineInfo)
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: {
        color: '#333',
        fontSize: 12
      },
      extraCssText: 'box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
      confine: true
    },
    legend: [{
      data: ['本端', '对端'],
      orient: 'horizontal',
      top: 20,
      right: 20,
      textStyle: {
        color: '#666'
      },
      itemStyle: {
        color: function(params) {
          return params.name === '本端' ? NODE_COLORS.local : NODE_COLORS.remote
        }
      }
    }, {
      data: lineTypes,
      orient: 'horizontal',
      top: 50,
      right: 20,
      textStyle: {
        color: '#666'
      },
      itemStyle: {
        color: function(params) {
          return LINE_TYPE_COLORS[params] || LINE_TYPE_COLORS['其他']
        }
      }
    }],
    toolbox: {
      feature: {
        restore: {
          title: '重置'
        },
        saveAsImage: {
          title: '保存图片'
        },
        myFullscreen: {
          show: true,
          title: '全屏',
          icon: 'path://M176 224h48v48h-48zm80-160H256v48h-48zm496 288h-48v-48h48zm-80 160h-48v-48h48zM176 832h48v48h-48zm704-448h48v48h-48zm0-160h48v48h-48zM176 384h48v48h-48zm704 448h48v48h-48zM896 64h-48v-48h48zm0 768h-48v-48h48zm-496 0h-48v-48h48zm496-704h-48v-48h48zm-496 0h-48v-48h48z',
          onclick: toggleFullscreen
        }
      },
      left: 20,
      top: 20
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      name: '线路拓扑',
      type: 'graph',
      layout: 'circular',
      circular: {
        rotateLabel: true
      },
      data: props.data.nodes.map(node => ({
        ...node,
        symbol: 'circle',
        symbolSize: node.category === 0 ? 40 : 20,
        itemStyle: {
          color: node.category === 0 ? NODE_COLORS.local : NODE_COLORS.remote,
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 10
        }
      })),
      links: props.data.links.map(link => ({
        ...link,
        lineStyle: {
          width: 2,
          curveness: calculateCurveness(link.connectionIndex, link.totalConnections),
          color: LINE_TYPE_COLORS[link.lineInfo.line_type] || LINE_TYPE_COLORS['其他'],
          opacity: 0.6,
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 2
        }
      })),
      categories: [
        { name: '本端', itemStyle: { color: NODE_COLORS.local } },
        { name: '对端', itemStyle: { color: NODE_COLORS.remote } }
      ],
      roam: true,
      draggable: true,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}',
        fontSize: 12,
        color: '#666',
        distance: 5
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 4
        },
        label: {
          fontSize: 13
        }
      }
    }]
  }
})

const handleChartClick = (params) => {
  if (params.dataType === 'node') {
    params.data.fixed = true
  }
}
</script>

<style scoped>
.statistics-chart-container {
  position: relative;
  height: 100%;
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
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
  background-color: #ffffff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #eee;
  border-top-color: #67c23a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 全屏样式 */
:fullscreen .statistics-chart-container {
  padding: 0;
  border-radius: 0;
  background: #ffffff;
}

:fullscreen .chart-wrapper {
  height: 100vh;
}

/* 兼容 webkit 浏览器 */
:-webkit-full-screen .statistics-chart-container {
  padding: 0;
  border-radius: 0;
  background: #ffffff;
}

:-webkit-full-screen .chart-wrapper {
  height: 100vh;
}
</style>