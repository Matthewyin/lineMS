<template>
  <div class="comparison-chart-container">
    <div class="charts-grid">
      <div class="chart-wrapper">
        <v-chart class="chart" :option="pieChartOption" autoresize />
      </div>
      <div class="chart-wrapper">
        <v-chart class="chart" :option="barChartOption" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

// 更新颜色映射，使用柔和的颜色
const COLOR_MAPS = {
  // 运营商维度颜色映射
  ISP: {
    '电信': '#4f46e5',    // 深蓝色
    '联通': '#22c55e',    // 绿色
    '移动': '#eab308',    // 黄色
    '中鹏通': '#3b82f6',  // 天蓝色
    '电信通': '#06b6d4'   // 青色
  },
  // 线路类型维度颜色映射 - 使用更柔和的颜色
  line_type: {
    '同城专线': '#60a5fa',   // 浅蓝色
    '长途专线': '#34d399',   // 青绿色
    'BGP': '#fbbf24',        // 金色
    '本地互联网': '#818cf8', // 淡紫色
    '裸光纤': '#2dd4bf',     // 绿松石色
    '光缆': '#38bdf8'        // 天蓝色
  },
  // 付费方维度颜色映射
  payer: {
    '总部': '#4f46e5',      // 深蓝色
    '分公司': '#22c55e',    // 绿色
    '子公司': '#eab308',    // 黄色
    '其他': '#60a5fa'       // 浅蓝色
  },
  // 线路本端维度颜色映射
  local: {
    '北京': '#4f46e5',      // 深蓝色
    '上海': '#22c55e',      // 绿色
    '广州': '#eab308',      // 黄色
    '深圳': '#60a5fa',      // 浅蓝色
    '成都': '#818cf8',      // 淡紫色
    '其他': '#2dd4bf'       // 绿松石色
  }
}

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  comparisonData: {
    type: Object,
    required: true
  },
  currentYear: {
    type: Number,
    required: true
  },
  nextYear: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasData: {
    type: Boolean,
    default: false
  },
  groupField: {
    type: String,
    required: true
  }
})

const getChartTitle = computed(() => {
  const titleMap = {
    'line_type': '线路类型',
    'ISP': '运营商',
    'local': '线路本端',
    'payer': '付费方'
  }
  return titleMap[props.groupField] || '数据'
})

const getCurrentColorMap = computed(() => {
  return COLOR_MAPS[props.groupField] || {}
})

const pieChartOption = computed(() => {
  if (!props.comparisonData || Object.keys(props.comparisonData).length === 0) {
    return {}
  }

  const data = []
  const colors = []

  Object.entries(props.comparisonData).forEach(([name, item]) => {
    const value = item[`data${props.currentYear}`]
    data.push({
      name,
      value
    })
    colors.push(getCurrentColorMap.value[name] || '#94a3b8') // 默认使用柔和的灰色
  })

  return {
    title: {
      text: `${getChartTitle.value}线路数量分布`,
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
        return `${params.name}: ${params.value}条`
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      left: 'center',
      itemWidth: 15,
      itemHeight: 10
    },
    color: colors,
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{c}条',
        fontSize: 12
      },
      labelLine: {
        length: 15,
        length2: 20,
        maxSurfaceAngle: 80
      },
      data: data
    }]
  }
})

const barChartOption = computed(() => {
  if (!props.comparisonData || Object.keys(props.comparisonData).length === 0) {
    return {}
  }

  const labels = Object.keys(props.comparisonData)
  const currentYearData = []
  const colors = labels.map(label => getCurrentColorMap.value[label] || '#94a3b8')

  labels.forEach(label => {
    const item = props.comparisonData[label]
    currentYearData.push(item[`cost${props.currentYear}`] / 10000)
  })

  return {
    title: {
      text: `${getChartTitle.value}费用分布`,
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        return `${params[0].name}<br/>${params[0].value.toFixed(2)}万元`
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '费用（万元）',
      nameLocation: 'middle',
      nameGap: 50,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: `费用`,
        type: 'bar',
        data: currentYearData,
        itemStyle: {
          color: (params) => colors[params.dataIndex]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}万'
        },
        barWidth: '40%'
      }
    ]
  }
})
</script>

<style scoped>
.comparison-chart-container {
  padding: 20px;
  background-color: var(--surface);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-wrapper {
  height: 400px;
  background-color: var(--background);
  border-radius: 4px;
  padding: 16px;
}

.chart {
  width: 100%;
  height: 100%;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .chart-wrapper {
    height: 300px;
  }
}
</style>