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
            <th 
              v-for="column in visibleColumns" 
              :key="column.key"
              @click="sortBy(column.key)"
              :class="{ sortable: column.sortable, active: sortKey === column.key }"
            >
              {{ column.label }}
              <span v-if="column.sortable" class="sort-icon">
                {{ sortKey === column.key ? (sortOrder === 'asc' ? '▲' : '▼') : '◆' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedData" :key="index">
            <td v-for="column in visibleColumns" :key="column.key">
              <template v-if="column.key === 'cost' && item[column.key] === 0">
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
      sortKey: '',
      sortOrder: 'asc',
      currentPage: 1,
      perPage: 10,
      selectedColumns: [],
      showColumnSelector: false
    };
  },
  computed: {
    allColumns() {
      return this.columns;
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
      
      if (this.sortKey) {
        const key = this.sortKey;
        const order = this.sortOrder;
        
        data.sort((a, b) => {
          let aValue = a[key];
          let bValue = b[key];
          
          // 处理字符串比较
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (aValue < bValue) return order === 'asc' ? -1 : 1;
          if (aValue > bValue) return order === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      return data;
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredData.slice(start, end);
    }
  },
  created() {
    // 默认选择所有列
    this.selectedColumns = this.allColumns.map(column => column.key);
    
    // 默认排序
    if (this.allColumns.length > 0) {
      const defaultSortColumn = this.allColumns.find(column => column.sortable);
      if (defaultSortColumn) {
        this.sortKey = defaultSortColumn.key;
      }
    }
  },
  methods: {
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },
    updateSelectedColumns(columns) {
      this.selectedColumns = columns;
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

.data-table th {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sort-icon {
  margin-left: 4px;
  font-size: 10px;
}

th.active {
  color: var(--primary);
}

@media (max-width: 768px) {
  .search-box {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .table-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>