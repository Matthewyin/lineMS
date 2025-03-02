<template>
  <div class="data-view">
    <h1 class="page-title">{{ currentYear }}年数据</h1>
    
    <div class="data-layout">
      <!-- 左侧筛选面板 -->
      <div class="filter-sidebar">
        <filter-panel 
          :data="currentData" 
          @filter-changed="handleFilterChange"
        />
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="content-area">
        <div class="data-table-container card">
          <data-table 
            :data="filteredData" 
            :columns="tableColumns"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import FilterPanel from '@/components/FilterPanel.vue';
import DataTable from '@/components/DataTable.vue';

export default {
  name: 'DataView',
  components: {
    FilterPanel,
    DataTable
  },
  data() {
    return {
      filters: {},
      tableColumns: [
        { key: 'ISP', label: '运营商', sortable: true },
        { key: 'line_type', label: '线路类型', sortable: true },
        { key: 'payer', label: '付费方', sortable: true },
        { key: 'local', label: '线路本端', sortable: true },
        { key: 'remote', label: '线路对端', sortable: true },
        { key: 'purpose', label: '业务用途', sortable: true },
        { key: 'bandwidth', label: '带宽', sortable: true },
        { key: 'cost_year', label: '费用（年）', sortable: true }
      ]
    };
  },
  computed: {
    ...mapState('data', ['currentYear']),
    ...mapGetters('data', ['currentData']),
    filteredData() {
      return this.currentData.filter(item => {
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
    }
  },
  methods: {
    handleFilterChange(filters) {
      this.filters = filters;
    }
  }
}
</script>

<style scoped>
.data-view {
  padding-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 24px;
  color: var(--primary);
}

.data-layout {
  display: flex;
  gap: 24px;
}

.filter-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.content-area {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

.data-table-container {
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .data-layout {
    flex-direction: column;
  }
  
  .filter-sidebar {
    width: 100%;
  }
}
</style>