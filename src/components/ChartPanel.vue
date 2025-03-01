<template>
  <div class="chart-panel card">
    <div class="chart-header">
      <h2 class="chart-title">{{ title }}</h2>
      <div class="chart-actions">
        <button 
          v-for="type in chartTypes" 
          :key="type.value"
          class="btn btn-text chart-type-btn"
          :class="{ active: currentChartType === type.value }"
          @click="currentChartType = type.value"
        >
          {{ type.label }}
        </button>
      </div>
    </div>
    
    <div class="chart-container">
      <div v-if="loading" class="chart-loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="!hasData" class="chart-no-data">
        <p>没有符合条件的数据</p>
      </div>
      
      <div v-else>
        <!-- 柱状图 -->
        <div v-if="currentChartType === 'bar'" class="chart-wrapper">
          <canvas ref="barChart"></canvas>
        </div>
        
        <!-- 饼图 -->
        <div v-else-if="currentChartType === 'pie'" class="chart-wrapper">
          <canvas ref="pieChart"></canvas>
        </div>
        
        <!-- 折线图 -->
        <div v-else-if="currentChartType === 'line'" class="chart-wrapper">
          <canvas ref="lineChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'ChartPanel',
  props: {
    title: {
      type: String,
      default: '数据统计'
    },
    data: {
      type: Array,
      required: true
    },
    groupBy: {
      type: String,
      required: true
    },
    valueField: {
      type: String,
      default: 'cost'
    },
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      currentChartType: 'bar',
      chartTypes: [
        { label: '柱状图', value: 'bar' },
        { label: '饼图', value: 'pie' },
        { label: '折线图', value: 'line' }
      ],
      barChart: null,
      pieChart: null,
      lineChart: null
    };
  },
  computed: {
    filteredData() {
      return this.data.filter(item => {
        for (const key in this.filters) {
          if (this.filters[key] && item[key] !== this.filters[key]) {
            return false;
          }
        }
        return true;
      });
    },
    chartData() {
      const groupedData = {};
      
      this.filteredData.forEach(item => {
        const groupValue = item[this.groupBy] || '未分类';
        
        if (!groupedData[groupValue]) {
          groupedData[groupValue] = {
            count: 0,
            total: 0
          };
        }
        
        groupedData[groupValue].count += 1;
        groupedData[groupValue].total += parseFloat(item[this.valueField] || 0);
      });
      
      // 转换为数组格式
      const labels = Object.keys(groupedData);
      const values = labels.map(label => groupedData[label].total);
      const counts = labels.map(label => groupedData[label].count);
      
      return {
        labels,
        values,
        counts
      };
    },
    hasData() {
      return this.chartData.labels.length > 0;
    }
  },
  watch: {
    currentChartType() {
      this.renderChart();
    },
    filteredData() {
      this.renderChart();
    }
  },
  mounted() {
    this.renderChart();
  },
  beforeUnmount() {
    this.destroyCharts();
  },
  methods: {
    renderChart() {
      this.loading = true;
      
      // 延迟一下，让加载状态显示出来
      setTimeout(() => {
        this.destroyCharts();
        
        if (this.hasData) {
          switch (this.currentChartType) {
            case 'bar':
              this.renderBarChart();
              break;
            case 'pie':
              this.renderPieChart();
              break;
            case 'line':
              this.renderLineChart();
              break;
          }
        }
        
        this.loading = false;
      }, 300);
    },
    destroyCharts() {
      if (this.barChart) {
        this.barChart.destroy();
        this.barChart = null;
      }
      
      if (this.pieChart) {
        this.pieChart.destroy();
        this.pieChart = null;
      }
      
      if (this.lineChart) {
        this.lineChart.destroy();
        this.lineChart = null;
      }
    },
    renderBarChart() {
      const ctx = this.$refs.barChart.getContext('2d');
      
      // 生成随机颜色
      const backgroundColors = this.chartData.labels.map(() => this.getRandomColor(0.7));
      
      this.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.chartData.labels,
          datasets: [{
            label: this.valueField === 'cost' ? '费用' : '数量',
            data: this.valueField === 'cost' ? this.chartData.values : this.chartData.counts,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.raw;
                  return `${label}: ${value}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    renderPieChart() {
      const ctx = this.$refs.pieChart.getContext('2d');
      
      // 生成随机颜色
      const backgroundColors = this.chartData.labels.map(() => this.getRandomColor(0.7));
      
      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.chartData.labels,
          datasets: [{
            data: this.valueField === 'cost' ? this.chartData.values : this.chartData.counts,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    renderLineChart() {
      const ctx = this.$refs.lineChart.getContext('2d');
      
      // 生成随机颜色
      const color = this.getRandomColor(0.7);
      
      this.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chartData.labels,
          datasets: [{
            label: this.valueField === 'cost' ? '费用' : '数量',
            data: this.valueField === 'cost' ? this.chartData.values : this.chartData.counts,
            backgroundColor: color,
            borderColor: color.replace('0.7', '1'),
            borderWidth: 2,
            tension: 0.3,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    getRandomColor(alpha = 1) {
      const colors = [
        `rgba(75, 192, 192, ${alpha})`,
        `rgba(54, 162, 235, ${alpha})`,
        `rgba(153, 102, 255, ${alpha})`,
        `rgba(255, 159, 64, ${alpha})`,
        `rgba(255, 99, 132, ${alpha})`,
        `rgba(255, 206, 86, ${alpha})`,
        `rgba(231, 233, 237, ${alpha})`,
        `rgba(156, 39, 176, ${alpha})`,
        `rgba(33, 150, 243, ${alpha})`,
        `rgba(76, 175, 80, ${alpha})`,
        `rgba(255, 152, 0, ${alpha})`,
        `rgba(121, 85, 72, ${alpha})`,
        `rgba(96, 125, 139, ${alpha})`
      ];
      
      // 使用固定的颜色，但根据索引循环使用
      const index = Math.floor(Math.random() * colors.length);
      return colors[index];
    }
  }
}
</script>

<style scoped>
.chart-panel {
  margin-bottom: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 18px;
  font-weight: 500;
}

.chart-actions {
  display: flex;
}

.chart-type-btn {
  margin-left: 8px;
  padding: 4px 8px;
  height: auto;
}

.chart-type-btn.active {
  background-color: var(--primary);
  color: var(--on-primary);
}

.chart-container {
  position: relative;
  height: 400px;
}

.chart-wrapper {
  height: 100%;
}

.chart-loading, .chart-no-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.6);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
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

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-actions {
    margin-top: 12px;
  }
  
  .chart-type-btn {
    margin-left: 0;
    margin-right: 8px;
  }
  
  .chart-container {
    height: 300px;
  }
}
</style>