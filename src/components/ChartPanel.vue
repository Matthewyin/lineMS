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
          @click="setChartType(type.value)"
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
      
      <div v-else class="chart-content">
        <div :id="chartWrapperId" class="chart-wrapper">
          <canvas :id="canvasId" ref="chartCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from '../utils/chartConfig';
import { v4 as uuidv4 } from 'uuid';

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
      default: 'cost_year'
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
        { label: '饼图', value: 'pie' }
      ],
      chart: null,
      chartId: uuidv4(),
      renderAttempts: 0
    };
  },
  computed: {
    canvasId() {
      return `chartCanvas-${this.chartId}`;
    },
    chartWrapperId() {
      return `chart-wrapper-${this.chartId}`;
    },
    filteredData() {
      return this.data.filter(item => {
        for (const key in this.filters) {
          // 如果筛选条件是数组且有值，检查项目的值是否在数组中
          if (Array.isArray(this.filters[key]) && this.filters[key].length > 0) {
            if (!this.filters[key].includes(item[key])) {
              return false;
            }
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
      
      // 过滤掉值为0的项目
      const filteredGroupedData = {};
      for (const key in groupedData) {
        const value = this.valueField === 'cost_year' ? groupedData[key].total : groupedData[key].count;
        if (value > 0) {
          filteredGroupedData[key] = groupedData[key];
        }
      }
      
      // 转换为数组格式
      const labels = Object.keys(filteredGroupedData);
      const values = labels.map(label => filteredGroupedData[label].total);
      const counts = labels.map(label => filteredGroupedData[label].count);
      
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
    filteredData: {
      handler() {
        this.renderChart();
      },
      deep: true
    }
  },
  mounted() {
    // 延迟渲染以确保DOM已完全加载
    setTimeout(() => {
      this.renderChart();
    }, 300);
  },
  updated() {
    // 在组件更新后，确保图表也更新
    this.$nextTick(() => {
      this.renderChart();
    });
  },
  beforeUnmount() {
    this.destroyChart();
  },
  methods: {
    setChartType(type) {
      this.currentChartType = type;
    },
    getCanvasElement() {
      return document.getElementById(this.canvasId);
    },
    renderChart() {
      if (!this.hasData) {
        this.loading = false;
        return;
      }
      
      this.loading = true;
      this.destroyChart();
      
      // 使用setTimeout确保DOM已完全更新
      setTimeout(() => {
        try {
          // 使用getElementById获取canvas元素
          const canvas = this.getCanvasElement();
          
          if (!canvas) {
            console.error(`Canvas元素不存在: ${this.canvasId}`);
            this.loading = false;
            
            // 如果尝试次数少于3次，再次尝试渲染
            if (this.renderAttempts < 3) {
              this.renderAttempts++;
              setTimeout(() => this.renderChart(), 300);
            }
            return;
          }
          
          // 确保canvas尺寸正确
          const container = document.getElementById(this.chartWrapperId);
          if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
          }
          
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            console.error('无法获取canvas上下文');
            this.loading = false;
            return;
          }
          
          // 检查数据是否为空
          if (this.chartData.labels.length === 0) {
            console.warn('没有数据可以渲染图表');
            this.loading = false;
            return;
          }
          
          // 重置尝试次数
          this.renderAttempts = 0;
          
          // 生成随机颜色
          const backgroundColors = this.chartData.labels.map((_, index) => {
            const colors = [
              'rgba(75, 192, 192, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(231, 233, 237, 0.7)',
              'rgba(156, 39, 176, 0.7)',
              'rgba(33, 150, 243, 0.7)',
              'rgba(76, 175, 80, 0.7)',
              'rgba(255, 152, 0, 0.7)',
              'rgba(121, 85, 72, 0.7)',
              'rgba(96, 125, 139, 0.7)'
            ];
            return colors[index % colors.length];
          });
          
          // 确保在创建新图表前销毁旧图表
          this.destroyChart();
          
          // 创建图表配置
          const config = {
            type: this.currentChartType,
            data: {
              labels: this.chartData.labels,
              datasets: [{
                label: this.valueField === 'cost_year' ? '费用' : '数量',
                data: this.valueField === 'cost_year' ? this.chartData.values : this.chartData.counts,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1,
                borderRadius: this.currentChartType === 'bar' ? 4 : 0,
                hoverOffset: 4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: {
                duration: 500
              },
              plugins: {
                legend: {
                  display: this.currentChartType === 'pie',
                  position: 'right'
                },
                tooltip: {
                  enabled: true,
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.raw;
                      
                      if (this.currentChartType === 'pie') {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        if (this.valueField === 'cost_year') {
                          return `${label}: ${this.formatCurrency(value)} (${percentage}%)`;
                        }
                        return `${label}: ${value} (${percentage}%)`;
                      }
                      
                      if (this.valueField === 'cost_year') {
                        return `${this.valueField === 'cost_year' ? '费用' : '数量'}: ${this.formatCurrency(value)}`;
                      }
                      return `${this.valueField === 'cost_year' ? '费用' : '数量'}: ${value}`;
                    }
                  }
                }
              },
              scales: this.currentChartType === 'bar' ? {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => this.valueField === 'cost_year' ? 
                      this.formatCurrency(value) : value
                  }
                }
              } : undefined
            }
          };
          
          // 创建图表 - 不使用nextTick，直接创建
          try {
            this.chart = new Chart(ctx, config);
            console.log('图表创建成功:', this.canvasId);
          } catch (err) {
            console.error('创建图表实例时出错:', err);
          }
          
          this.loading = false;
        } catch (error) {
          console.error('创建图表时出错:', error);
          this.loading = false;
        }
      }, 300); // 减少延迟时间
    },
    destroyChart() {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
    },
    formatCurrency(value) {
      // 使用货币格式显示费用
      return new Intl.NumberFormat('zh-CN', { 
        style: 'currency', 
        currency: 'CNY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
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
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.chart-content {
  height: 100%;
  width: 100%;
  position: relative;
}

.chart-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
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