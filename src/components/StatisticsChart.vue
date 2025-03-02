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
  
  // 图表配置
  const chartOption = computed(() => {
    if (!props.hasData) return {}
  
    return {
      title: {
        text: '线路拓扑关系图',
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1e293b'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.dataType === 'node') {
            return `<div style="font-weight: bold; color: #1e293b;">${params.name}</div>`
          }
          return formatLineInfo(params.data.lineInfo)
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#1e293b',
          fontSize: 13
        },
        extraCssText: 'box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
        confine: true
      },
      legend: {
        data: ['本端', '对端'],
        orient: 'horizontal',
        bottom: 10,
        left: 'center',
        textStyle: {
          color: '#475569'
        }
      },
      toolbox: {
        feature: {
          restore: {},
          saveAsImage: {}
        }
      },
      animationDuration: 1000,
      animationEasingUpdate: 'quinticInOut',
      series: [{
        name: '线路拓扑',
        type: 'graph',
        layout: 'force',
        data: props.data.nodes,
        links: props.data.links.map(link => ({
          ...link,
          lineStyle: {
            width: 2,
            curveness: calculateCurveness(link.connectionIndex, link.totalConnections),
            color: '#4f46e5',
            opacity: 0.8
          }
        })),
        categories: [
          { name: '本端' },
          { name: '对端' }
        ],
        roam: true,
        draggable: true,
        force: {
          repulsion: 1500,
          edgeLength: 250,
          gravity: 0.1,
          layoutAnimation: false
        },
        itemStyle: {
          color: function(params) {
            return params.data.category === 0 ? '#4f46e5' : '#22c55e'
          },
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 10
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          fontSize: 13,
          color: '#1e293b',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: [4, 8],
          borderRadius: 4
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4
          },
          label: {
            fontSize: 14
          }
        }
      }]
    }
  })
  
  const handleChartClick = (params) => {
    if (params.dataType === 'node') {
      // 保存节点的新位置
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
    padding: 20px;
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
    border: 3px solid #e2e8f0;
    border-top-color: #4f46e5;
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