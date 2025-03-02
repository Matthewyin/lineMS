<template>
  <div class="comparison-panel card">
    <h2 class="comparison-title">数据对比</h2>
    
    <div class="comparison-filters">
      <div class="form-group">
        <label class="form-label">分组字段</label>
        <div class="select-wrapper">
          <select v-model="groupField" class="form-control" @change="updateComparison">
            <option 
              v-for="field in groupFields" 
              :key="field.key" 
              :value="field.key"
            >
              {{ field.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 图表组件 -->
    <comparison-chart
      :chart-data="chartData"
      :comparison-data="comparisonData"
      :current-year="currentYear"
      :next-year="nextYear"
      :group-field="groupField"
      :compare-field="compareField"
      :loading="loading"
      :has-data="hasData"
      @chart-element-click="$emit('chart-element-click', $event)"
    />
    
    <!-- 汇总表格组件 -->
    <comparison-summary-table
      :comparison-data="comparisonData"
      :totals="totals"
      :current-year="currentYear"
      :next-year="nextYear"
      :group-field="groupField"
      :loading="loading"
      :has-data="hasData"
    />
    
    <!-- 新的变化明细表格组件 -->
    <comparison-change-detail
      :data2025="filteredData2025"
      :data2026="filteredData2026"
      :current-year="currentYear"
      :next-year="nextYear"
      :loading="loading"
      :has-data="hasData"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ComparisonChart from './ComparisonChart.vue';
import ComparisonSummaryTable from './ComparisonSummaryTable.vue';
import ComparisonChangeDetail from './ComparisonChangeDetail.vue';

export default {
  name: 'ComparisonPanel',
  components: {
    ComparisonChart,
    ComparisonSummaryTable,
    ComparisonChangeDetail
  },
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
      compareField: 'count',
      groupField: 'ISP'
    };
  },
  computed: {
    ...mapState('data', ['currentYear']),
    nextYear() {
      return this.currentYear === 2025 ? 2026 : 2025;
    },
    compareFields() {
      return [
        { key: 'count', label: '线路数量' }
      ];
    },
    groupFields() {
      return [
        { key: 'ISP', label: '运营商' },
        { key: 'line_type', label: '线路类型' },
        { key: 'payer', label: '付费方' },
        { key: 'local', label: '线路本端' }
      ];
    },
    filteredData2025() {
      return this.data2025.filter(item => {
        for (const key in this.filters) {
          if (Array.isArray(this.filters[key]) && this.filters[key].length > 0) {
            if (!this.filters[key].includes(item[key])) {
              return false;
            }
          }
        }
        return true;
      });
    },
    filteredData2026() {
      return this.data2026.filter(item => {
        for (const key in this.filters) {
          if (Array.isArray(this.filters[key]) && this.filters[key].length > 0) {
            if (!this.filters[key].includes(item[key])) {
              return false;
            }
          }
        }
        return true;
      });
    },
    comparisonData() {
      const result = {};
      
      // 处理第一年数据（当前选择的年份）
      const firstYearData = this.currentYear === 2025 ? this.filteredData2025 : this.filteredData2026;
      const secondYearData = this.currentYear === 2025 ? this.filteredData2026 : this.filteredData2025;
      const firstYearKey = `data${this.currentYear}`;
      const secondYearKey = `data${this.nextYear}`;
      const firstYearCostKey = `cost${this.currentYear}`;
      const secondYearCostKey = `cost${this.nextYear}`;
      
      // 处理第一年数据
      firstYearData.forEach(item => {
        const groupValue = item[this.groupField] || '未分类';
        
        if (!result[groupValue]) {
          result[groupValue] = {
            [firstYearKey]: 0,
            [secondYearKey]: 0,
            difference: 0,
            percentChange: 0,
            [firstYearCostKey]: parseFloat(item.cost_year || 0),
            [secondYearCostKey]: 0,
            costDifference: 0
          };
        } else {
          result[groupValue][firstYearCostKey] += parseFloat(item.cost_year || 0);
        }
        
        // 对于线路数量，每条记录计数为1
        result[groupValue][firstYearKey] += 1;
      });
      
      // 处理第二年数据
      secondYearData.forEach(item => {
        const groupValue = item[this.groupField] || '未分类';
        
        if (!result[groupValue]) {
          result[groupValue] = {
            [firstYearKey]: 0,
            [secondYearKey]: 0,
            difference: 0,
            percentChange: 0,
            [firstYearCostKey]: 0,
            [secondYearCostKey]: parseFloat(item.cost_year || 0),
            costDifference: 0
          };
        } else {
          result[groupValue][secondYearCostKey] += parseFloat(item.cost_year || 0);
        }
        
        // 对于线路数量，每条记录计数为1
        result[groupValue][secondYearKey] += 1;
      });
      
      // 计算差异和变化率
      for (const key in result) {
        // 线路数量差异 (第二年 - 第一年)
        result[key].difference = result[key][secondYearKey] - result[key][firstYearKey];
        
        // 费用差异
        result[key].costDifference = result[key][secondYearCostKey] - result[key][firstYearCostKey];
        
        // 变化率（基于线路数量）
        if (result[key][firstYearKey] !== 0) {
          result[key].percentChange = (result[key].difference / result[key][firstYearKey]) * 100;
        } else if (result[key][secondYearKey] !== 0) {
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
      let totalCost2025 = 0;
      let totalCost2026 = 0;
      
      for (const key in this.comparisonData) {
        total2025 += this.comparisonData[key].data2025;
        total2026 += this.comparisonData[key].data2026;
        totalCost2025 += this.comparisonData[key].cost2025;
        totalCost2026 += this.comparisonData[key].cost2026;
      }
      
      const totalDifference = total2026 - total2025;
      const totalCostDifference = totalCost2026 - totalCost2025;
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
        totalCost2025,
        totalCost2026,
        totalCostDifference,
        totalPercentChange
      };
    },
    hasData() {
      return Object.keys(this.comparisonData).length > 0;
    },
    chartData() {
      // 获取所有键
      const allLabels = Object.keys(this.comparisonData);
      
      // 如果没有数据，返回空数组
      if (allLabels.length === 0) {
        return {
          labels: [],
          data2025: [],
          data2026: []
        };
      }
      
      // 过滤掉两年线路数都为0的项目
      const filteredLabels = allLabels.filter(label => {
        const item = this.comparisonData[label];
        return !(item.data2025 === 0 && item.data2026 === 0);
      });
      
      // 如果过滤后没有数据，返回空数组
      if (filteredLabels.length === 0) {
        return {
          labels: [],
          data2025: [],
          data2026: []
        };
      }
      
      // 根据过滤后的标签生成数据
      const data2025 = filteredLabels.map(label => this.comparisonData[label].data2025);
      const data2026 = filteredLabels.map(label => this.comparisonData[label].data2026);
      
      return {
        labels: filteredLabels,
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
    },
    compareField() {
      this.updateComparison();
    },
    groupField() {
      this.updateComparison();
    }
  },
  mounted() {
    // 延迟渲染以确保DOM已完全加载
    setTimeout(() => {
      this.updateComparison();
    }, 300);
  },
  methods: {
    updateComparison() {
      this.loading = true;
      
      // 延迟一下，让加载状态显示出来
      setTimeout(() => {
        this.loading = false;
      }, 300);
    },
    getFieldLabel(field) {
      const fieldObj = [...this.compareFields, ...this.groupFields].find(f => f.key === field);
      return fieldObj ? fieldObj.label : field;
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
  color: var(--text-primary);
}

.comparison-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.comparison-filters .form-group {
  flex: 1;
}

.form-label {
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
  color: var(--text-secondary);
}

.select-wrapper {
  position: relative;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid var(--divider);
  background-color: var(--background);
  color: var(--text-primary);
  font-size: 14px;
  appearance: none;
}

.select-wrapper::after {
  content: '▼';
  font-size: 12px;
  color: var(--text-secondary);
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

@media (max-width: 768px) {
  .comparison-filters {
    flex-direction: column;
    gap: 12px;
  }
}
</style>