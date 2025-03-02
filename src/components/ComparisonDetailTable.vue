<template>
  <div class="detail-table-container" v-if="hasData && !loading">
    <h3 class="table-title">变化明细表</h3>
    
    <div class="table-filters">
      <div class="form-group">
        <label class="form-label">筛选条件</label>
        <div class="select-wrapper">
          <select v-model="changeType" class="form-control">
            <option value="all">所有变化</option>
            <option value="added">新增线路</option>
            <option value="removed">移除线路</option>
            <option value="changed">费用变化</option>
            <option value="bandwidth">带宽变化</option>
          </select>
        </div>
      </div>
    </div>
    
    <div v-if="filteredDetails.length === 0" class="no-data-message">
      没有符合条件的变化明细
    </div>
    
    <table v-else class="detail-table">
      <thead>
        <tr>
          <th>变化类型</th>
          <th>线路类型</th>
          <th>运营商</th>
          <th>付费方</th>
          <th>线路本端</th>
          <th>线路对端</th>
          <th>{{ currentYear }}年带宽</th>
          <th>{{ nextYear }}年带宽</th>
          <th>带宽变化</th>
          <th>{{ currentYear }}年费用</th>
          <th>{{ nextYear }}年费用</th>
          <th>费用变化</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in filteredDetails" :key="index" :class="getRowClass(item.changeType)">
          <td>{{ getChangeTypeLabel(item.changeType) }}</td>
          <td>{{ item.line_type || '-' }}</td>
          <td>{{ item.ISP || '-' }}</td>
          <td>{{ item.payer || '-' }}</td>
          <td>{{ item.local || '-' }}</td>
          <td>{{ item.remote || '-' }}</td>
          <td>{{ formatBandwidth(item.bandwidth2025 || 0) }}</td>
          <td>{{ formatBandwidth(item.bandwidth2026 || 0) }}</td>
          <td :class="getDifferenceClass(item.bandwidthDifference)">
            {{ formatBandwidthDifference(item.bandwidthDifference) }}
          </td>
          <td>{{ formatCurrency(item.cost2025 || 0) }}</td>
          <td>{{ formatCurrency(item.cost2026 || 0) }}</td>
          <td :class="getDifferenceClass(item.costDifference)">
            {{ formatCurrencyDifference(item.costDifference) }}
          </td>
        </tr>
      </tbody>
    </table>
    
    <div class="pagination-container" v-if="filteredDetails.length > pageSize">
      <button 
        class="pagination-button" 
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        上一页
      </button>
      <span class="pagination-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        class="pagination-button" 
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComparisonDetailTable',
  props: {
    data2025: {
      type: Array,
      required: true
    },
    data2026: {
      type: Array,
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
  data() {
    return {
      changeType: 'all',
      currentPage: 1,
      pageSize: 10
    };
  },
  computed: {
    // 计算两年数据的变化明细
    detailChanges() {
      const changes = [];
      const data2025Map = new Map();
      const data2026Map = new Map();
      
      // 创建哈希函数，用于生成唯一标识
      const hashObject = (obj) => {
        const relevantFields = {
          line_type: obj.line_type || '',
          ISP: obj.ISP || '',
          payer: obj.payer || '',
          local: obj.local || '',
          remote: obj.remote || ''
        };
        return JSON.stringify(relevantFields);
      };
      
      // 将2025年数据放入Map
      this.data2025.forEach(line => {
        const lineHash = hashObject(line);
        data2025Map.set(lineHash, line);
      });
      
      // 将2026年数据放入Map
      this.data2026.forEach(line => {
        const lineHash = hashObject(line);
        data2026Map.set(lineHash, line);
      });
      
      // 查找新增的线路（2026年有，2025年没有）
      data2026Map.forEach((line2026, lineHash) => {
        if (!data2025Map.has(lineHash)) {
          changes.push({
            ...line2026,
            changeType: 'added',
            cost2025: 0,
            cost2026: parseFloat(line2026.cost_year || 0),
            costDifference: parseFloat(line2026.cost_year || 0),
            bandwidth2025: 0,
            bandwidth2026: parseFloat(line2026.bandwidth || 0),
            bandwidthDifference: parseFloat(line2026.bandwidth || 0)
          });
        }
      });
      
      // 查找移除的线路（2025年有，2026年没有）
      data2025Map.forEach((line2025, lineHash) => {
        if (!data2026Map.has(lineHash)) {
          changes.push({
            ...line2025,
            changeType: 'removed',
            cost2025: parseFloat(line2025.cost_year || 0),
            cost2026: 0,
            costDifference: -parseFloat(line2025.cost_year || 0),
            bandwidth2025: parseFloat(line2025.bandwidth || 0),
            bandwidth2026: 0,
            bandwidthDifference: -parseFloat(line2025.bandwidth || 0)
          });
        }
      });
      
      // 查找变化的线路（两年都有，但费用或带宽不同）
      data2025Map.forEach((line2025, lineHash) => {
        if (data2026Map.has(lineHash)) {
          const line2026 = data2026Map.get(lineHash);
          const cost2025 = parseFloat(line2025.cost_year || 0);
          const cost2026 = parseFloat(line2026.cost_year || 0);
          const bandwidth2025 = parseFloat(line2025.bandwidth || 0);
          const bandwidth2026 = parseFloat(line2026.bandwidth || 0);
          
          const costChanged = cost2025 !== cost2026;
          const bandwidthChanged = bandwidth2025 !== bandwidth2026;
          
          if (costChanged || bandwidthChanged) {
            let changeType = 'changed';
            if (bandwidthChanged && !costChanged) {
              changeType = 'bandwidth';
            }
            
            changes.push({
              ...line2025,
              ...line2026,
              changeType: changeType,
              cost2025: cost2025,
              cost2026: cost2026,
              costDifference: cost2026 - cost2025,
              bandwidth2025: bandwidth2025,
              bandwidth2026: bandwidth2026,
              bandwidthDifference: bandwidth2026 - bandwidth2025
            });
          }
        }
      });
      
      return changes;
    },
    
    // 根据筛选条件过滤变化明细
    filteredDetails() {
      let filteredData = this.paginatedDetails;
      
      if (this.changeType === 'all') {
        return filteredData;
      }
      
      return filteredData.filter(item => {
        if (this.changeType === 'bandwidth') {
          // 对于带宽变化，我们需要检查带宽是否有变化
          return item.changeType === 'bandwidth' || 
                 (item.changeType === 'changed' && item.bandwidthDifference !== 0);
        }
        return item.changeType === this.changeType;
      });
    },
    
    // 分页后的数据
    paginatedDetails() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      
      let filteredData = this.detailChanges;
      
      // 根据筛选条件过滤
      if (this.changeType !== 'all') {
        filteredData = filteredData.filter(item => item.changeType === this.changeType);
      }
      
      return filteredData.slice(startIndex, endIndex);
    },
    
    // 总页数
    totalPages() {
      let filteredData = this.detailChanges;
      
      // 根据筛选条件过滤
      if (this.changeType !== 'all') {
        filteredData = filteredData.filter(item => item.changeType === this.changeType);
      }
      
      return Math.ceil(filteredData.length / this.pageSize);
    }
  },
  watch: {
    changeType() {
      // 切换筛选条件时重置页码
      this.currentPage = 1;
    }
  },
  methods: {
    getChangeTypeLabel(type) {
      const labels = {
        'added': '新增线路',
        'removed': '移除线路',
        'changed': '费用变化',
        'bandwidth': '带宽变化'
      };
      return labels[type] || type;
    },
    getRowClass(type) {
      const classes = {
        'added': 'row-added',
        'removed': 'row-removed',
        'changed': 'row-changed',
        'bandwidth': 'row-bandwidth'
      };
      return classes[type] || '';
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
    },
    formatBandwidth(value) {
      if (value === 0) return '-';
      if (value >= 1000) {
        return `${(value/1000).toFixed(1)}G`;
      }
      return `${value}M`;
    },
    formatBandwidthDifference(value) {
      if (value === 0) return '-';
      const prefix = value > 0 ? '+' : '';
      if (Math.abs(value) >= 1000) {
        return `${prefix}${(value/1000).toFixed(1)}G`;
      }
      return `${prefix}${value}M`;
    }
  }
}
</script>

<style scoped>
.detail-table-container {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--surface);
  transition: all 0.3s ease;
  padding: 16px;
  margin-bottom: 24px;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.table-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.select-wrapper {
  position: relative;
}

.form-control {
  width: 200px;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--divider);
  background-color: var(--background);
  color: var(--text-primary);
  font-size: 14px;
  appearance: none;
  cursor: pointer;
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

.no-data-message {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.detail-table th, .detail-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--divider);
  color: var(--text-primary);
}

.detail-table th {
  font-weight: 500;
  color: var(--text-secondary);
}

.row-added {
  background-color: rgba(var(--success-rgb), 0.05);
}

.row-removed {
  background-color: rgba(var(--error-rgb), 0.05);
}

.row-changed {
  background-color: rgba(var(--warning-rgb), 0.05);
}

.row-bandwidth {
  background-color: rgba(var(--info-rgb), 0.05);
}

.text-positive {
  color: var(--success);
}

.text-negative {
  color: var(--error);
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.pagination-button {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid var(--divider);
  background-color: var(--background);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .detail-table th, .detail-table td {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .form-control {
    width: 100%;
  }
}
</style> 