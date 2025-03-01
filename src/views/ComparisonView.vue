<template>
  <div class="comparison-view">
    <h1 class="page-title">2025年与2026年数据对比</h1>
    
    <filter-panel 
      :data="combinedData" 
      @filter-changed="handleFilterChange"
    />
    
    <comparison-panel 
      :data2025="data2025"
      :data2026="data2026"
      :filters="filters"
    />
    
    <div class="comparison-tables grid-2">
      <div class="card">
        <h2 class="table-title">2025年数据</h2>
        <data-table 
          :data="filteredData2025" 
          :columns="tableColumns"
        />
      </div>
      
      <div class="card">
        <h2 class="table-title">2026年数据</h2>
        <data-table 
          :data="filteredData2026" 
          :columns="tableColumns"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FilterPanel from '@/components/FilterPanel.vue';
import DataTable from '@/components/DataTable.vue';
import ComparisonPanel from '@/components/ComparisonPanel.vue';

export default {
  name: 'ComparisonView',
  components: {
    FilterPanel,
    DataTable,
    ComparisonPanel
  },
  data() {
    return {
      filters: {},
      tableColumns: [
        { key: 'isp', label: 'ISP', sortable: true },
        { key: 'payer', label: 'Payer', sortable: true },
        { key: 'local', label: 'Local', sortable: true },
        { key: 'remote', label: 'Remote', sortable: true },
        { key: 'purpose', label: 'Purpose', sortable: true },
        { key: 'bandwidth', label: '带宽', sortable: true },
        { key: 'cost', label: '费用', sortable: true }
      ]
    };
  },
  computed: {
    ...mapGetters('data', ['data2025', 'data2026']),
    combinedData() {
      return [...this.data2025, ...this.data2026];
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
.comparison-view {
  padding-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 24px;
  color: var(--primary);
}

.comparison-tables {
  margin-top: 24px;
}

.table-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
}

@media (max-width: 1200px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>