<!-- 占位符组件 - 待重新实现 -->
<template>
  <div class="comparison-chart-container">
    <div v-if="loading" class="chart-loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="!hasData" class="chart-no-data">
      <p>没有符合条件的数据</p>
    </div>
    
    <div v-else class="chart-placeholder">
      <p>图表功能正在重新实现中...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComparisonChart',
  props: {
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
    groupField: {
      type: String,
      required: true
    },
    compareField: {
      type: String,
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
  }
}
</script>

<style scoped>
.comparison-chart-container {
  position: relative;
  height: 400px;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
  padding: 16px;
  background-color: var(--surface);
  transition: all 0.3s ease;
}

.chart-loading, .chart-no-data, .chart-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.chart-placeholder {
  background-color: rgba(0, 0, 0, 0.03);
  border: 2px dashed var(--divider);
  font-size: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--divider);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 