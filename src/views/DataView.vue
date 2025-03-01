<template>
  <div class="data-view">
    <h1 class="page-title">{{ currentYear }}年数据</h1>
    
    <filter-panel 
      :data="currentData" 
      @filter-changed="handleFilterChange"
    />
    
    <div class="data-table-container card">
      <data-table 
        :data="filteredData" 
        :columns="tableColumns"
      />
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
    ...mapState('data', ['currentYear']),
    ...mapGetters('data', ['currentData']),
    filteredData() {
      return this.currentData.filter(item => {
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
.data-view {
  padding-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 24px;
  color: var(--primary);
}

.data-table-container {
  margin-bottom: 24px;
}
</style>