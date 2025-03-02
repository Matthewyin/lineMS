<template>
  <div class="statistics-chart-container">
    <div v-if="loading" class="chart-loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="!hasData" class="chart-no-data">
      <p>没有符合条件的数据</p>
    </div>
    
    <div v-else :id="chartWrapperId" class="chart-wrapper">
      <canvas :id="canvasId" ref="statisticsChart"></canvas>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'StatisticsChart',
  props: {
    chartData: {
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
  },
  data() {
    return {
      statisticsChart: null,
      chartId: uuidv4(),
      darkModeMediaQuery: null
    };
  },
  computed: {
    canvasId() {
      return `statisticsChart-${this.chartId}`;
    },
    chartWrapperId() {
      return `statistics-wrapper-${this.chartId}`;
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.renderChart();
      }
    }
  },
  mounted() {
    // 延迟渲染以确保DOM已完全加载
    setTimeout(() => {
      this.renderChart();
    }, 300);
    
    // 监听系统主题变化
    this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkModeMediaQuery.addEventListener('change', this.handleThemeChange);
  },
  beforeUnmount() {
    this.destroyChart();
    
    // 移除主题变化监听
    if (this.darkModeMediaQuery) {
      this.darkModeMediaQuery.removeEventListener('change', this.handleThemeChange);
    }
  },
  methods: {
    renderChart() {
      if (!this.hasData || this.loading) return;
      
      this.destroyChart();
      
      // 基本实现，需要根据实际需求完善
      console.log('StatisticsChart将在未来实现');
    },
    destroyChart() {
      if (this.statisticsChart) {
        this.statisticsChart.destroy();
        this.statisticsChart = null;
      }
    },
    handleThemeChange() {
      // 重新渲染图表以适应新主题
      this.renderChart();
    }
  }
};
</script>

<style scoped>
.statistics-chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

.chart-wrapper {
  height: 100%;
  width: 100%;
}

.chart-loading,
.chart-no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
