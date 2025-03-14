<template>
  <div class="change-detail-container card" v-if="hasData && !loading">
    <h3 class="section-title">变化明细表</h3>
    
    <div class="filters-container">
      <div class="form-group">
        <label class="form-label">变化类型</label>
        <div class="select-wrapper">
          <select v-model="selectedChangeType" class="form-control">
            <option value="all">所有变化</option>
            <option value="added">新增线路</option>
            <option value="removed">移除线路</option>
            <option value="cost_changed">费用变化</option>
            <option value="bandwidth_changed">带宽变化</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">排序方式</label>
        <div class="select-wrapper">
          <select v-model="sortBy" class="form-control">
            <option value="type">变化类型</option>
            <option value="isp">运营商</option>
            <option value="line_type">线路类型</option>
            <option value="cost_diff">费用变化</option>
            <option value="bandwidth_diff">带宽变化</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">排序顺序</label>
        <div class="btn-group">
          <button class="btn btn-text" :class="{ 'active': !sortDesc }" @click="sortDesc = false">
            升序
          </button>
          <button class="btn btn-text" :class="{ 'active': sortDesc }" @click="sortDesc = true">
            降序
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="filteredChanges.length === 0" class="empty-state">
      <p>没有符合条件的变化明细数据</p>
    </div>
    
    <div v-else class="table-container">
      <table class="change-table">
        <thead>
          <tr>
            <th class="change-type">变化类型</th>
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
          <tr 
            v-for="(item, index) in filteredChanges" 
            :key="index" 
            :class="getRowClass(item.changeType)"
          >
            <td class="change-type">
              <span class="change-badge" :class="getChangeBadgeClass(item.changeType)">
                {{ getChangeTypeLabel(item.changeType) }}
              </span>
            </td>
            <td>{{ item.line_type || '-' }}</td>
            <td>{{ item.ISP || '-' }}</td>
            <td>{{ item.payer || '-' }}</td>
            <td>{{ item.local || '-' }}</td>
            <td>{{ item.remote || '-' }}</td>
            <td>{{ formatBandwidth(item.bandwidth2025) }}</td>
            <td>{{ formatBandwidth(item.bandwidth2026) }}</td>
            <td :class="getDifferenceClass(item.bandwidthDifference)">
              {{ formatBandwidthDifference(item.bandwidthDifference) }}
            </td>
            <td>{{ formatCurrency(item.cost2025) }}</td>
            <td>{{ formatCurrency(item.cost2026) }}</td>
            <td :class="getDifferenceClass(item.costDifference)">
              {{ formatCurrencyDifference(item.costDifference) }}
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="summary-container">
        <div class="summary-card">
          <h4>变化统计</h4>
          <div class="summary-item">
            <span class="label">新增线路：</span>
            <span class="value">{{ getChangeTypeCount('added') }}条</span>
          </div>
          <div class="summary-item">
            <span class="label">移除线路：</span>
            <span class="value">{{ getChangeTypeCount('removed') }}条</span>
          </div>
          <div class="summary-item">
            <span class="label">费用变化：</span>
            <span class="value">{{ getChangeTypeCount('cost_changed') }}条</span>
          </div>
          <div class="summary-item">
            <span class="label">带宽变化：</span>
            <span class="value">{{ getChangeTypeCount('bandwidth_changed') }}条</span>
          </div>
        </div>
        
        <div class="summary-card">
          <h4>费用影响</h4>
          <div class="summary-item">
            <span class="label">新增总费用：</span>
            <span class="value">{{ formatCurrency(getChangeTypeTotalCost('added', 'cost2026')) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">移除总费用：</span>
            <span class="value">{{ formatCurrency(getChangeTypeTotalCost('removed', 'cost2025')) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">费用净变化：</span>
            <span class="value" :class="getDifferenceClass(getTotalCostDifference())">
              {{ formatCurrencyDifference(getTotalCostDifference()) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="result-summary" v-if="filteredChanges.length > 0">
        共 {{ filteredChanges.length }} 条记录
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComparisonChangeDetail',
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
      selectedChangeType: 'all',
      sortBy: 'type',
      sortDesc: true
    };
  },
  computed: {
    // 计算两年数据的所有变化明细
    allChanges() {
      const changes = [];
      
      // 处理数据并转换带宽值为数值
      const processData = (data) => {
        return data.map(item => {
          const bandwidthStr = item.bandwidth || '';
          // 提取带宽的数值部分
          const bandwidthValue = parseFloat(bandwidthStr.replace(/[^0-9.]/g, '')) || 0;
          return {
            ...item,
            bandwidthValue,
            cost_year: parseFloat(item.cost_year || 0)
          };
        });
      };
      
      const processedData2025 = processData(this.data2025);
      const processedData2026 = processData(this.data2026);
      
      // 创建一个唯一键函数，用于标识每条线路
      const getLineKey = (line) => {
        return line.local_line_number || `${line.ISP || ''}_${line.line_type || ''}_${line.local || ''}_${line.payer || ''}`;
      };
      
      const data2025Map = new Map();
      const data2026Map = new Map();
      
      // 将2025年数据放入Map
      processedData2025.forEach(line => {
        const key = getLineKey(line);
        data2025Map.set(key, line);
      });
      
      // 将2026年数据放入Map
      processedData2026.forEach(line => {
        const key = getLineKey(line);
        data2026Map.set(key, line);
      });
      
      // 1. 查找移除的线路（2025年有，2026年没有）
      data2025Map.forEach((line2025, key) => {
        if (!data2026Map.has(key)) {
          changes.push({
            ...line2025,
            changeType: 'removed',
            cost2025: line2025.cost_year,
            cost2026: 0,
            costDifference: -line2025.cost_year,
            bandwidth2025: line2025.bandwidthValue,
            bandwidth2026: 0,
            bandwidthDifference: -line2025.bandwidthValue
          });
        }
      });
      
      // 2. 查找新增的线路（2026年有，2025年没有）
      data2026Map.forEach((line2026, key) => {
        if (!data2025Map.has(key)) {
          changes.push({
            ...line2026,
            changeType: 'added',
            cost2025: 0,
            cost2026: line2026.cost_year,
            costDifference: line2026.cost_year,
            bandwidth2025: 0,
            bandwidth2026: line2026.bandwidthValue,
            bandwidthDifference: line2026.bandwidthValue
          });
        }
      });
      
      // 3. 查找变化的线路（两年都有，但属性有变化）
      data2025Map.forEach((line2025, key) => {
        if (data2026Map.has(key)) {
          const line2026 = data2026Map.get(key);
          const cost2025 = line2025.cost_year;
          const cost2026 = line2026.cost_year;
          const bandwidth2025 = line2025.bandwidthValue;
          const bandwidth2026 = line2026.bandwidthValue;
          
          // 检查是否有属性变化
          const hasChanges = (
            cost2025 !== cost2026 || 
            bandwidth2025 !== bandwidth2026 ||
            line2025.ISP !== line2026.ISP ||
            line2025.line_type !== line2026.line_type ||
            line2025.payer !== line2026.payer ||
            line2025.local !== line2026.local
          );
          
          if (hasChanges) {
            const costDifference = cost2026 - cost2025;
            const bandwidthDifference = bandwidth2026 - bandwidth2025;
            
            const costChanged = Math.abs(costDifference) > 0.01; // 考虑浮点误差
            const bandwidthChanged = Math.abs(bandwidthDifference) > 0.01; // 考虑浮点误差
            
            if (costChanged && bandwidthChanged) {
              changes.push({
                ...line2026,
                changeType: 'cost_bandwidth_changed',
                cost2025,
                cost2026,
                costDifference,
                bandwidth2025,
                bandwidth2026,
                bandwidthDifference
              });
            } else if (costChanged) {
              changes.push({
                ...line2026,
                changeType: 'cost_changed',
                cost2025,
                cost2026,
                costDifference,
                bandwidth2025,
                bandwidth2026,
                bandwidthDifference: 0
              });
            } else if (bandwidthChanged) {
              changes.push({
                ...line2026,
                changeType: 'bandwidth_changed',
                cost2025,
                cost2026,
                costDifference: 0,
                bandwidth2025,
                bandwidth2026,
                bandwidthDifference
              });
            }
          }
        }
      });
      
      return changes;
    },
    
    // 根据筛选条件过滤变化明细
    filteredChanges() {
      let result = [...this.allChanges];
      
      // 根据变化类型筛选
      if (this.selectedChangeType !== 'all') {
        if (this.selectedChangeType === 'cost_changed') {
          result = result.filter(item => 
            item.changeType === 'cost_changed' || 
            item.changeType === 'cost_bandwidth_changed'
          );
        } else if (this.selectedChangeType === 'bandwidth_changed') {
          result = result.filter(item => 
            item.changeType === 'bandwidth_changed' || 
            item.changeType === 'cost_bandwidth_changed'
          );
        } else {
          result = result.filter(item => item.changeType === this.selectedChangeType);
        }
      }
      
      // 根据选择的字段排序
      result.sort((a, b) => {
        let valueA, valueB;
        
        switch (this.sortBy) {
          case 'type':
            valueA = this.getChangeTypeSortValue(a.changeType);
            valueB = this.getChangeTypeSortValue(b.changeType);
            break;
          case 'isp':
            valueA = a.ISP || '';
            valueB = b.ISP || '';
            break;
          case 'line_type':
            valueA = a.line_type || '';
            valueB = b.line_type || '';
            break;
          case 'cost_diff':
            valueA = Math.abs(a.costDifference);
            valueB = Math.abs(b.costDifference);
            break;
          case 'bandwidth_diff':
            valueA = Math.abs(a.bandwidthDifference);
            valueB = Math.abs(b.bandwidthDifference);
            break;
          default:
            valueA = a[this.sortBy] || 0;
            valueB = b[this.sortBy] || 0;
        }
        
        // 字符串比较
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          const result = valueA.localeCompare(valueB);
          return this.sortDesc ? -result : result;
        }
        
        // 数值比较
        const result = valueA - valueB;
        return this.sortDesc ? -result : result;
      });
      
      return result;
    }
  },
  methods: {
    // 获取变化类型的显示标签
    getChangeTypeLabel(type) {
      const labels = {
        'added': '新增',
        'removed': '移除',
        'cost_changed': '付费方变化',
      //  'bandwidth_changed': '带宽变化',
        'cost_bandwidth_changed': '费用/带宽变化'
      };
      return labels[type] || type;
    },
    
    // 获取行的CSS类
    getRowClass(type) {
      return {
        'added-row': type === 'added',
        'removed-row': type === 'removed',
        'changed-row': type === 'cost_changed' || type === 'bandwidth_changed' || type === 'cost_bandwidth_changed'
      };
    },
    
    // 获取变化标识的CSS类
    getChangeBadgeClass(type) {
      return {
        'added-badge': type === 'added',
        'removed-badge': type === 'removed',
        'cost-changed-badge': type === 'cost_changed',
        'bandwidth-changed-badge': type === 'bandwidth_changed',
        'cost-bandwidth-changed-badge': type === 'cost_bandwidth_changed'
      };
    },
    
    // 格式化带宽显示
    formatBandwidth(value) {
      if (value === 0 || value === undefined || value === null) return '-';
      return `${value}M`;
    },
    
    // 格式化带宽差异显示
    formatBandwidthDifference(diff) {
      if (diff === 0 || diff === undefined || diff === null) return '-';
      const prefix = diff > 0 ? '+' : '';
      return `${prefix}${diff}M`;
    },
    
    // 格式化货币显示
    formatCurrency(value) {
      if (value === 0 || value === undefined || value === null) return '-';
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },
    
    // 格式化货币差异显示
    formatCurrencyDifference(diff) {
      if (diff === 0 || diff === undefined || diff === null) return '-';
      const prefix = diff > 0 ? '+' : '';
      return prefix + this.formatCurrency(diff).slice(1); // 去掉货币符号
    },
    
    // 获取差异值的CSS类
    getDifferenceClass(diff) {
      if (!diff || diff === 0) return '';
      return diff > 0 ? 'positive-diff' : 'negative-diff';
    },
    
    // 获取变化类型的排序值
    getChangeTypeSortValue(type) {
      const values = {
        'added': 1,
        'removed': 2,
        'cost_changed': 3,
        'bandwidth_changed': 4,
        'cost_bandwidth_changed': 5
      };
      return values[type] || 0;
    },
    
    // 获取指定变化类型的数量
    getChangeTypeCount(type) {
      if (type === 'cost_changed') {
        return this.allChanges.filter(item => 
          item.changeType === 'cost_changed' || 
          item.changeType === 'cost_bandwidth_changed'
        ).length;
      } else if (type === 'bandwidth_changed') {
        return this.allChanges.filter(item => 
          item.changeType === 'bandwidth_changed' || 
          item.changeType === 'cost_bandwidth_changed'
        ).length;
      }
      return this.allChanges.filter(item => item.changeType === type).length;
    },
    
    // 获取指定变化类型的总费用
    getChangeTypeTotalCost(type, costField) {
      return this.allChanges
        .filter(item => item.changeType === type)
        .reduce((sum, item) => sum + (item[costField] || 0), 0);
    },
    
    // 获取总费用差异
    getTotalCostDifference() {
      return this.allChanges.reduce((sum, item) => sum + (item.costDifference || 0), 0);
    }
  }
};
</script>

<style scoped>
.change-detail-container {
  margin-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.btn-group {
  display: flex;
}

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.btn-group .btn:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.btn-group .btn.active {
  background-color: var(--primary);
  color: var(--on-primary);
}

.table-container {
  overflow-x: auto;
  margin-bottom: 16px;
}

.change-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.change-table thead th {
  text-align: left;
  padding: 12px 16px;
  background-color: var(--primary);
  color: var(--on-primary);
  font-weight: 500;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
}

.change-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.change-table .change-type {
  width: 120px;
}

.change-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.added-badge {
  background-color: #e6f7ed;
  color: #1e8e3e;
}

.removed-badge {
  background-color: #fce8e6;
  color: #d93025;
}

.cost-changed-badge {
  background-color: #e8f0fe;
  color: #1a73e8;
}

.bandwidth-changed-badge {
  background-color: #f1e8fd;
  color: #8430ce;
}

.cost-bandwidth-changed-badge {
  background-color: #fff8e1;
  color: #f9a825;
}

.added-row {
  background-color: rgba(46, 204, 113, 0.05);
}

.removed-row {
  background-color: rgba(231, 76, 60, 0.05);
}

.changed-row {
  background-color: rgba(52, 152, 219, 0.05);
}

.positive-diff {
  color: #1e8e3e;
  font-weight: 500;
}

.negative-diff {
  color: #d93025;
  font-weight: 500;
}

.empty-state {
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
  background-color: var(--background);
  border-radius: 4px;
}

.result-summary {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: right;
}

.summary-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
}

.summary-card {
  flex: 1;
  min-width: 250px;
  background-color: var(--surface);
  border-radius: 4px;
  box-shadow: 0 1px 2px var(--shadow-color);
  padding: 16px;
}

.summary-card h4 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-item .label {
  color: var(--text-secondary);
}

.summary-item .value {
  font-weight: 500;
}

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
  }
}
</style> 