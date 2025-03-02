<template>
  <div class="comparison-table-container" v-if="hasData && !loading">
    <h3 class="table-title">数据汇总表</h3>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>{{ getFieldLabel(groupField) }}</th>
          <th>{{ currentYear }}年线路数</th>
          <th>{{ nextYear }}年线路数</th>
          <th>线路数差异</th>
          <th>{{ currentYear }}年费用</th>
          <th>{{ nextYear }}年费用</th>
          <th>费用差异</th>
          <th>变化率</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, key) in comparisonData" :key="key">
          <td>{{ key }}</td>
          <td>{{ currentYear === 2025 ? item.data2025 : item.data2026 }}</td>
          <td>{{ currentYear === 2025 ? item.data2026 : item.data2025 }}</td>
          <td :class="getDifferenceClass(item.difference)">
            {{ formatDifference(item.difference) }}
          </td>
          <td>{{ formatCurrency(currentYear === 2025 ? item.cost2025 : item.cost2026) }}</td>
          <td>{{ formatCurrency(currentYear === 2025 ? item.cost2026 : item.cost2025) }}</td>
          <td :class="getDifferenceClass(item.costDifference)">
            {{ formatCurrencyDifference(item.costDifference) }}
          </td>
          <td :class="getDifferenceClass(item.percentChange)">
            {{ formatPercentage(item.percentChange) }}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td><strong>总计</strong></td>
          <td><strong>{{ currentYear === 2025 ? totals.total2025 : totals.total2026 }}</strong></td>
          <td><strong>{{ currentYear === 2025 ? totals.total2026 : totals.total2025 }}</strong></td>
          <td :class="getDifferenceClass(totals.totalDifference)">
            <strong>{{ formatDifference(totals.totalDifference) }}</strong>
          </td>
          <td><strong>{{ formatCurrency(currentYear === 2025 ? totals.totalCost2025 : totals.totalCost2026) }}</strong></td>
          <td><strong>{{ formatCurrency(currentYear === 2025 ? totals.totalCost2026 : totals.totalCost2025) }}</strong></td>
          <td :class="getDifferenceClass(totals.totalCostDifference)">
            <strong>{{ formatCurrencyDifference(totals.totalCostDifference) }}</strong>
          </td>
          <td :class="getDifferenceClass(totals.totalPercentChange)">
            <strong>{{ formatPercentage(totals.totalPercentChange) }}</strong>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ComparisonSummaryTable',
  props: {
    comparisonData: {
      type: Object,
      required: true
    },
    totals: {
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
    loading: {
      type: Boolean,
      default: false
    },
    hasData: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getFieldLabel(field) {
      const fieldMap = {
        'count': '线路数量',
        'ISP': '运营商',
        'line_type': '线路类型',
        'payer': '付费方',
        'local': '线路本端',
        'remote': '线路对端',
        'purpose': '业务用途'
      };
      return fieldMap[field] || field;
    },
    formatValue(value) {
      return value.toString();
    },
    formatDifference(value) {
      if (value > 0) {
        return `+${this.formatValue(value)}`;
      }
      return this.formatValue(value);
    },
    formatPercentage(value) {
      if (value === null || value === undefined || isNaN(value)) {
        return '-';
      }
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
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('zh-CN', { 
        style: 'currency', 
        currency: 'CNY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },
    formatCurrencyDifference(value) {
      if (value > 0) {
        return `+${this.formatCurrency(value)}`;
      }
      return this.formatCurrency(value);
    }
  }
}
</script>

<style scoped>
.table-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.comparison-table-container {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--surface);
  transition: all 0.3s ease;
  padding: 16px;
  margin-bottom: 24px;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.comparison-table th, .comparison-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--divider);
  color: var(--text-primary);
}

.comparison-table th {
  font-weight: 500;
  color: var(--text-secondary);
}

.comparison-table tfoot td {
  border-top: 2px solid var(--divider);
  font-weight: 500;
}

.text-positive {
  color: var(--success);
}

.text-negative {
  color: var(--error);
}

@media (max-width: 768px) {
  .comparison-table th, .comparison-table td {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style> 