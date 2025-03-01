<template>
  <div class="comparison-panel card">
    <h2 class="comparison-title">数据对比</h2>
    
    <div class="comparison-filters">
      <div class="form-group">
        <label class="form-label">对比字段</label>
        <div class="select-wrapper">
          <select v-model="compareField" class="form-control" @change="updateComparison">
            <option v-for="field in compareFields" :key="field.key" :value="field.key">
              {{ field.label }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">分组字段</label>
        <div class="select-wrapper">
          <select v-model="groupField" class="form-control" @change="updateComparison">
            <option v-for="field in groupFields" :key="field.key" :value="field.key">
              {{ field.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="comparison-chart-container">
      <div v-if="loading" class="chart-loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="!hasData" class="chart-no-data">
        <p>没有符合条件的数据</p>
      </div>
      
      <div v-else class="chart-wrapper">
        <canvas ref="comparisonChart"></canvas>
      </div>
    </div>
    
    <div class="comparison-table-container" v-if="hasData && !loading">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>{{ getFieldLabel(groupField) }}</th>
            <th>2025年 {{ getFieldLabel(compareField) }}</th>
            <th>2026年 {{ getFieldLabel(compareField) }}</th>
            <th>差异</th>
            <th>变化率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, key) in comparisonData" :key="key">
            <td>{{ key }}</td>
            <td>{{ formatValue(item.data2025) }}</td>
            <td>{{ formatValue(item.data2026) }}</td>
            <td :class="getDifferenceClass(item.difference)">
              {{ formatDifference(item.difference) }}
            </td>
            <td :class="getDifferenceClass(item.percentChange)">
              {{ formatPercentage(item.percentChange) }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td><strong>总计</strong></td>
            <td><strong>{{ formatValue(totals.total2025) }}</strong></td>
            <td><strong>{{ formatValue(totals.total2026) }}</strong></td>
            <td :class="getDifferenceClass(totals.totalDifference)">
              <strong>{{ formatDifference(totals.totalDifference) }}</strong>
            </td>
            <td :class="getDifferenceClass(totals.totalPercentChange)">
              <strong>{{ formatPercentage(totals.totalPercentChange) }}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'ComparisonPanel',
  props: {
    data2025: {
      type: Array,
      required: true
    },
    data2026: {
      type: Array,
      required: true
    },
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      compareField: 'cost',
      groupField: 'isp',
      comparisonChart: null
    };
  },
  computed: {
    compareFields() {
      return [
        { key: 'cost', label: '费用' },
        { key: 'bandwidth', label: '带宽' }
      ];
    },
    groupFields() {
      return [
        { key: 'isp', label: 'ISP' },
        { key: 'payer', label: 'Payer' },
        { key: 'local', label: 'Local' },
        { key: 'remote', label: 'Remote' },
        { key: 'purpose', label: 'Purpose' }
      ];
    },
    filteredData2025() {
      return this.data2025.filter(item => {
        for (const key in this.filters) {
          if (this.filters[key] && item[key] !== this.filters[key]) {
            return false;
          }
        }
        return true;
      });
    },
    filteredData2026() {
      return this.data2026.filter(item => {
        for (const key in this.filters) {
          if (this.filters[key] && item[key] !== this.filters[key]) {
            return false;
          }
        }
        return true;
      });
    },
    comparisonData() {
      const result = {};
      
      // 处理2025年数据
      this.filteredData2025.forEach(item => {
        const groupValue = item[this.groupField] || '未分类';
        
        if (!result[groupValue]) {
          result[groupValue] = {
            data2025: 0,
            data2026: 0,
            difference: 0,
            percentChange: 0
          };
        }
        
        result[groupValue].data2025 += parseFloat(item[this.compareField] || 0);
      });
      
      // 处理2026年数据
      this.filteredData2026.forEach(item => {
        const groupValue = item[this.groupField] || '未分类';
        
        if (!result[groupValue]) {
          result[groupValue] = {
            data2025: 0,
            data2026: 0,
            difference: 0,
            percentChange: 0
          };
        }
        
        result[groupValue].data2026 += parseFloat(item[this.compareField] || 0);
      });
      
      // 计算差异和变化率
      for (const key in result) {
        result[key].difference = result[key].data2026 - result[key].data2025;
        
        if (result[key].data2025 !== 0) {
          result[key].percentChange = (result[key].difference / result[key].data2025) * 100;
        } else if (result[key].data2026 !== 0) {
          result[key].percentChange = 100; // 从0增长到非0，变化率为100%
        } else {
          result[key].percentChange = 0; // 两者都为0，变化率为0
        }
      }
      
      return result;
    },
    totals() {
      let total2025 = 0;
      let total2026 = 0;
      
      for (const key in this.comparisonData) {
        total2025 += this.comparisonData[key].data2025;
        total2026 += this.comparisonData[key].data2026;
      }
      
      const totalDifference = total2026 - total2025;
      let totalPercentChange = 0;
      
      if (total2025 !== 0) {
        totalPercentChange = (totalDifference / total2025) * 100;
      } else if (total2026 !== 0) {
        totalPercentChange = 100;
      }
      
      return {
        total2025,
        total2026,
        totalDifference,
        totalPercentChange
      };
    },
    hasData() {
      return Object.keys(this.comparisonData).length > 0;
    },
    chartData() {
      const labels = Object.keys(this.comparisonData);
      const data2025 = labels.map(label => this.comparisonData[label].data2025);
      const data2026 = labels.map(label => this.comparisonData[label].data2026);
      
      return {
        labels,
        data2025,
        data2026
      };
    }
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.updateComparison();
      }
    }
  },
  mounted() {
    this.updateComparison();
  },
  beforeUnmount() {
    this.destroyChart();
  },
  methods: {
    updateComparison() {
      this.loading = true;
      
      // 延迟一下，让加载状态显示出来
      setTimeout(() => {
        this.renderComparisonChart();
        this.loading = false;
      }, 300);
    },
    destroyChart() {
      if (this.comparisonChart) {
        this.comparisonChart.destroy();
        this.comparisonChart = null;
      }
    },
    renderComparisonChart() {
      this.destroyChart();
      
      if (!this.hasData) return;
      
      const ctx = this.$refs.comparisonChart.getContext('2d');
      
      this.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.chartData.labels,
          datasets: [
            {
              label: '2025年',
              data: this.chartData.data2025,
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: '2026年',
              data: this.chartData.data2026,
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.raw;
                  return `${label}: ${this.formatValue(value)}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: this.getFieldLabel(this.compareField)
              }
            },
            x: {
              title: {
                display: true,
                text: this.getFieldLabel(this.groupField)
              }
            }
          }
        }
      });
    },
    getFieldLabel(field) {
      const fieldObj = [...this.compareFields, ...this.groupFields].find(f => f.key === field);
      return fieldObj ? fieldObj.label : field;
    },
    formatValue(value) {
      if (this.compareField === 'cost') {
        return value.toFixed(2);
      }
      return value.toString();
    },
    formatDifference(value) {
      if (value > 0) {
        return `+${this.formatValue(value)}`;
      }
      return this.formatValue(value);
    },
    formatPercentage(value) {
      if (value > 0) {
        return `+${value.toFixed(2)}%`;
      }
      return `${value.toFixed(2)}%`;
    },
    getDifferenceClass(value) {
      if (value > 0) {
        return 'text-positive';
      } else if (value < 0) {
        return 'text-negative';
      }
      return '';
    }
  }
}
</script>

<style scoped>
.comparison-panel {
  margin-bottom: 24px;
}

.comparison-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
}

.comparison-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.comparison-filters .form-group {
  flex: 1;
}

.comparison-chart-container {
  position: relative;
  height: 400px;
  margin-bottom: 24px;
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

.comparison-table-container {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.comparison-table th, .comparison-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.comparison-table th {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.comparison-table tfoot td {
  border-top: 2px solid rgba(0, 0, 0, 0.12);
  font-weight: 500;
}

.text-positive {
  color: #4caf50;
}

.text-negative {
  color: #f44336;
}

@media (max-width: 768px) {
  .comparison-filters {
    flex-direction: column;
    gap: 12px;
  }
  
  .comparison-chart-container {
    height: 300px;
  }
}
</style>