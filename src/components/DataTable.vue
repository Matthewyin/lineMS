<template>
  <div class="data-table-container">
    <div class="table-actions">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索..." 
          class="form-control"
        />
      </div>
      <button class="btn btn-text" @click="showColumnSelector = true">
        自定义列
      </button>
    </div>
    
    <div class="table-wrapper elevation-1">
      <table class="data-table">
        <thead>
          <tr>
            <th class="serial-column">序号</th>
            <th 
              v-for="column in visibleColumns" 
              :key="column.key"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedData" :key="index">
            <td class="serial-column">{{ getSerialNumber(index) }}</td>
            <td v-for="column in visibleColumns" :key="column.key">
              <template v-if="column.key === 'cost_year'">
                {{ formatCurrency(item[column.key]) }}
              </template>
              <template v-else-if="column.key === 'cost' && item[column.key] === 0">
                第三方付费
              </template>
              <template v-else>
                {{ item[column.key] }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <table-pagination 
      :total="filteredData.length" 
      :per-page="perPage" 
      :current-page="currentPage"
      @page-changed="currentPage = $event"
      @update:per-page="updatePerPage"
    />
    
    <column-selector 
      v-if="showColumnSelector"
      :columns="allColumns"
      :selected-columns="selectedColumns"
      @update:selected-columns="updateSelectedColumns"
      @close="showColumnSelector = false"
    />
  </div>
</template>

<script>
import TablePagination from './Pagination.vue';
import ColumnSelector from './ColumnSelector.vue';

export default {
  name: 'DataTable',
  components: {
    TablePagination,
    ColumnSelector
  },
  props: {
    data: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      searchQuery: '',
      currentPage: 1,
      perPage: 10,
      selectedColumns: [],
      showColumnSelector: false,
      // 定义固定的排序规则
      sortRules: {
        ISP: ['中国电信', '中国联通', '中国移动', '中国广电', '其他'],
        line_type: ['MSTP', 'MPLS VPN', '互联网专线', '裸光纤', '其他'],
        payer: ['总部', '分公司', '第三方'],
        purpose: ['生产', '办公', '备份', '其他']
      },
      // 定义列的显示顺序
      columnOrder: [
        'id', 'ISP', 'line_type', 'bandwidth', 'payer', 
        'cost_year', 'local', 'remote', 'purpose', 'contract_end'
      ]
    };
  },
  computed: {
    allColumns() {
      // 创建一个新数组，而不是直接修改props
      return [...this.columns].sort((a, b) => {
        const indexA = this.columnOrder.indexOf(a.key);
        const indexB = this.columnOrder.indexOf(b.key);
        
        // 如果找不到，放到最后
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
    },
    visibleColumns() {
      if (this.selectedColumns.length === 0) {
        return this.allColumns;
      }
      return this.allColumns.filter(column => this.selectedColumns.includes(column.key));
    },
    filteredData() {
      let data = [...this.data];
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        data = data.filter(item => {
          return Object.values(item).some(value => 
            String(value).toLowerCase().includes(query)
          );
        });
      }
      
      // 应用固定排序规则
      data.sort((a, b) => {
        // 首先按ISP排序
        if (a.ISP !== b.ISP) {
          const ispOrder = this.getOrderByRule('ISP', a.ISP, b.ISP);
          if (ispOrder !== 0) return ispOrder;
        }
        
        // 然后按线路类型排序
        if (a.line_type !== b.line_type) {
          const typeOrder = this.getOrderByRule('line_type', a.line_type, b.line_type);
          if (typeOrder !== 0) return typeOrder;
        }
        
        // 然后按付费方排序
        if (a.payer !== b.payer) {
          const payerOrder = this.getOrderByRule('payer', a.payer, b.payer);
          if (payerOrder !== 0) return payerOrder;
        }
        
        // 最后按业务用途排序
        if (a.purpose !== b.purpose) {
          const purposeOrder = this.getOrderByRule('purpose', a.purpose, b.purpose);
          if (purposeOrder !== 0) return purposeOrder;
        }
        
        // 如果以上都相同，按ID排序
        return a.id - b.id;
      });
      
      return data;
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredData.slice(start, end);
    }
  },
  created() {
    // 初始化选中的列
    this.$nextTick(() => {
      this.selectedColumns = this.allColumns.map(column => column.key);
    });
  },
  methods: {
    getOrderByRule(field, valueA, valueB) {
      if (!this.sortRules[field]) return 0;
      
      const indexA = this.sortRules[field].indexOf(valueA);
      const indexB = this.sortRules[field].indexOf(valueB);
      
      // 如果在规则中找不到，放到最后
      if (indexA === -1 && indexB === -1) return valueA.localeCompare(valueB, 'zh-CN');
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    },
    getSerialNumber(index) {
      // 计算序号，考虑当前页码和每页显示数量
      return (this.currentPage - 1) * this.perPage + index + 1;
    },
    updateSelectedColumns(columns) {
      this.selectedColumns = columns;
    },
    updatePerPage(value) {
      this.perPage = parseInt(value);
      this.currentPage = 1; // 重置到第一页
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
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    }
  }
}
</script>

<style scoped>
.data-table-container {
  margin-bottom: 24px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-box {
  width: 300px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 4px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th, .data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.serial-column {
  width: 60px;
  text-align: center;
}

.data-table th {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .data-table th {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .data-table th, .data-table td {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }
  
  .data-table tbody tr:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
}
</style>