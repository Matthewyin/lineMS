<template>
  <div class="filter-panel card">
    <h2 class="filter-panel-title">筛选条件</h2>
    <div class="filter-form">
      <div class="filter-grid">
        <div class="form-group" v-for="[key, field] in sortedFilterFields" :key="key">
          <label class="form-label">{{ field.label }}</label>
          <div class="filter-container">
            <div class="filter-options-container">
              <div class="filter-options">
                <label v-for="(option, index) in allOptions[key]" 
                       :key="option" 
                       class="filter-option"
                       v-show="index < 6 || showAllOptions[key]">
                  <input type="checkbox" :value="option" v-model="selectedFilters[key]" @change="applyFilters">
                  <span>{{ option }}</span>
                </label>
                <div v-if="allOptions[key].length > 6" class="show-more">
                  <button class="btn-show-more" @click="toggleShowMore(key)">
                    {{ showAllOptions[key] ? '收起' : '显示更多...' }}
                  </button>
                </div>
              </div>
              <div class="filter-actions">
                <button class="btn btn-text btn-sm" @click="selectAll(key)">全选</button>
                <button class="btn btn-text btn-sm" @click="deselectAll(key)">清空</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="filter-row">
        <div class="form-group filter-actions">
          <button class="btn btn-text" @click="resetFilters">重置</button>
        </div>
      </div>
    </div>
    
    <div class="active-filters" v-if="hasActiveFilters">
      <h3 class="active-filters-title">已选筛选条件:</h3>
      <div class="filter-chips">
        <div 
          v-for="(values, key) in activeFilters" 
          :key="key"
          class="chip"
        >
          {{ filterFields[key] ? filterFields[key].label : key }}: 
          {{ Array.isArray(values) ? values.join(', ') : values }}
          <button class="chip-remove" @click="removeFilter(key)">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterPanel',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedFilters: {
        ISP: [],
        line_type: [],
        bandwidth: [],
        payer: [],
        local: [],
        remote: [],
        purpose: []
      },
      showAllOptions: {
        ISP: false,
        line_type: false,
        bandwidth: false,
        payer: false,
        local: false,
        remote: false,
        purpose: false
      },
      filterFields: {
        ISP: { label: '运营商', order: 2 },
        line_type: { label: '线路类型', order: 3 },
        payer: { label: '付费方', order: 4 },
        local: { label: '线路本端', order: 5 },
        remote: { label: '线路对端', order: 7 },
        purpose: { label: '业务用途', order: 6 },
        bandwidth: { label: '带宽', order: 1 }
      },
      // 定义固定的排序规则
      sortRules: {
        ISP: ['中国电信', '中国联通', '中国移动'],
        line_type: ['MSTP', 'MPLS VPN', '互联网专线', '裸光纤', '其他'],
        payer: ['总部', '分公司', '第三方'],
        purpose: ['生产', '办公', '备份', '其他']
      }
    }
  },
  computed: {
    // 获取排序后的筛选字段
    sortedFilterFields() {
      const fields = Object.entries(this.filterFields)
      return fields.sort((a, b) => a[1].order - b[1].order)
    },
    allOptions() {
      // 从数据中提取筛选选项
      const options = {
        ISP: [],
        line_type: [],
        payer: [],
        local: [],
        remote: [],
        purpose: [],
        bandwidth: []
      }
      
      this.data.forEach(item => {
        for (const key in options) {
          if (key === 'bandwidth') {
            // 特殊处理带宽字段
            if (item[key] && !options[key].includes(item[key])) {
              options[key].push(item[key])
            }
          } else if (item[key] && !options[key].includes(item[key])) {
            options[key].push(item[key])
          }
        }
      })
      
      // 应用固定排序规则
      for (const key in options) {
        if (key === 'bandwidth') {
          // 带宽按数值大小排序
          options[key].sort((a, b) => {
            const valueA = this.extractBandwidthValue(a)
            const valueB = this.extractBandwidthValue(b)
            return valueA - valueB
          })
        } else if (this.sortRules[key]) {
          // 如果有固定排序规则，按规则排序
          options[key].sort((a, b) => {
            const indexA = this.sortRules[key].indexOf(a)
            const indexB = this.sortRules[key].indexOf(b)
            
            // 如果在规则中找不到，放到最后
            if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'zh-CN')
            if (indexA === -1) return 1
            if (indexB === -1) return -1
            
            return indexA - indexB
          })
        } else {
          // 对于没有固定规则的字段（如local和remote），按中文排序
          options[key].sort((a, b) => a.localeCompare(b, 'zh-CN'))
        }
      }
      
      return options
    },
    activeFilters() {
      const active = {}
      for (const key in this.selectedFilters) {
        if (this.selectedFilters[key].length > 0 && 
            this.selectedFilters[key].length < this.allOptions[key].length) {
          active[key] = this.selectedFilters[key]
        }
      }
      return active
    },
    hasActiveFilters() {
      return Object.keys(this.activeFilters).length > 0
    }
  },
  methods: {
    // 提取带宽数值的辅助函数
    extractBandwidthValue(bandwidthStr) {
      if (!bandwidthStr) return 0
      
      // 如果是数字，直接返回
      if (typeof bandwidthStr === 'number') return bandwidthStr
      
      // 如果是字符串，提取数字部分
      // 例如 "100Mbps" -> 100, "2G" -> 2000
      const numericPart = bandwidthStr.replace(/[^0-9.]/g, '')
      let value = parseFloat(numericPart)
      
      // 处理单位转换
      if (bandwidthStr.toLowerCase().includes('g')) {
        value *= 1000 // 转换为Mbps
      }
      
      return value || 0
    },
    toggleShowMore(key) {
      this.showAllOptions[key] = !this.showAllOptions[key]
    },
    selectAll(field) {
      this.selectedFilters[field] = [...this.allOptions[field]]
      this.applyFilters()
    },
    deselectAll(field) {
      this.selectedFilters[field] = []
      this.applyFilters()
    },
    applyFilters() {
      // 如果某个筛选条件为空，视为选择全部
      const filtersToApply = { ...this.selectedFilters }
      for (const key in filtersToApply) {
        if (filtersToApply[key].length === 0) {
          filtersToApply[key] = [...this.allOptions[key]]
        }
      }
      this.$emit('filter-changed', filtersToApply)
    },
    resetFilters() {
      // 重置为全选状态
      for (const key in this.selectedFilters) {
        this.selectedFilters[key] = [...this.allOptions[key]]
      }
      this.applyFilters()
    },
    removeFilter(key) {
      // 移除筛选条件时设为全选
      this.selectedFilters[key] = [...this.allOptions[key]]
      this.applyFilters()
    },
    initializeFilters() {
      // 初始化时设置所有选项为选中状态
      for (const key in this.allOptions) {
        this.selectedFilters[key] = [...this.allOptions[key]]
      }
      this.applyFilters()
    }
  },
  watch: {
    data: {
      immediate: true,
      handler() {
        // 当数据变化时，重新初始化筛选条件
        this.$nextTick(() => {
          this.initializeFilters()
        })
      }
    }
  }
}
</script>

<style scoped>
.filter-panel {
  margin-bottom: 24px;
  height: 100%;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.filter-panel-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.form-group {
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.filter-container {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.filter-options-container {
  border-top: none;
}

.filter-options {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
}

.filter-option {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 2px;
}

.filter-option:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.filter-option input {
  margin-right: 8px;
}

.show-more {
  padding: 6px 8px;
  text-align: center;
}

.btn-show-more {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.btn-show-more:hover {
  text-decoration: underline;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  border-top: 1px solid #ddd;
  gap: 8px;
}

.filter-actions .btn {
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  color: #333;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-text {
  color: #333 !important;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-text:hover {
  color: #000 !important;
  background-color: rgba(0, 0, 0, 0.04);
}

.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ddd;
}

.active-filters-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #666;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 16px;
  padding: 0 12px;
  font-size: 14px;
  background-color: #e9f5fe;
  color: #3498db;
}

.chip-remove {
  background: none;
  border: none;
  color: #666;
  margin-left: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-remove:hover {
  color: #dc3545;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .filter-panel {
    background-color: #1e1e1e;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }

  .filter-panel-title {
    color: #e1e1e1;
  }

  .form-label {
    color: #b0b0b0;
  }

  .filter-container {
    border-color: #444;
  }

  .filter-option:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .btn-show-more {
    color: #5dade2;
  }

  .filter-actions {
    border-top-color: #444;
  }

  .filter-actions .btn,
  .btn-text {
    color: #e1e1e1 !important;
  }

  .btn-text:hover {
    color: #ffffff !important;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .active-filters {
    border-top-color: #444;
  }

  .active-filters-title {
    color: #b0b0b0;
  }

  .chip {
    background-color: #2c3e50;
    color: #5dade2;
  }
}
</style>