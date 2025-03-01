<template>
  <div class="statistics-view">
    <h1 class="page-title">{{ currentYear }}年统计分析</h1>
    
    <filter-panel 
      :data="currentData" 
      @filter-changed="handleFilterChange"
    />
    
    <div class="statistics-grid">
      <div class="statistics-summary card">
        <h2 class="summary-title">数据概览</h2>
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon isp-icon">
              <span class="material-icons">business</span>
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ uniqueValues.isp.length }}</div>
              <div class="summary-label">ISP数量</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon cost-icon">
              <span class="material-icons">payments</span>
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ totalCost.toFixed(2) }}</div>
              <div class="summary-label">总费用</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon bandwidth-icon">
              <span class="material-icons">speed</span>
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ totalBandwidth }}</div>
              <div class="summary-label">总带宽</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon lines-icon">
              <span class="material-icons">timeline</span>
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ filteredData.length }}</div>
              <div class="summary-label">线路数量</div>
            </div>
          </div>
        </div>
      </div>
      
      <chart-panel 
        title="按ISP统计"
        :data="filteredData"
        group-by="isp"
        value-field="cost"
        :filters="filters"
      />
      
      <chart-panel 
        title="按Payer统计"
        :data="filteredData"
        group-by="payer"
        value-field="cost"
        :filters="filters"
      />
      
      <chart-panel 
        title="按Purpose统计"
        :data="filteredData"
        group-by="purpose"
        value-field="cost"
        :filters="filters"
      />
      
      <chart-panel 
        title="按Local统计"
        :data="filteredData"
        group-by="local"
        value-field="cost"
        :filters="filters"
      />
      
      <chart-panel 
        title="按Remote统计"
        :data="filteredData"
        group-by="remote"
        value-field="cost"
        :filters="filters"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import FilterPanel from '@/components/FilterPanel.vue';
import ChartPanel from '@/components/ChartPanel.vue';

export default {
  name: 'StatisticsView',
  components: {
    FilterPanel,
    ChartPanel
  },
  data() {
    return {
      filters: {}
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
    },
    uniqueValues() {
      const result = {
        isp: [],
        payer: [],
        local: [],
        remote: [],
        purpose: []
      };
      
      this.filteredData.forEach(item => {
        for (const key in result) {
          if (item[key] && !result[key].includes(item[key])) {
            result[key].push(item[key]);
          }
        }
      });
      
      return result;
    },
    totalCost() {
      return this.filteredData.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
    },
    totalBandwidth() {
      return this.filteredData.reduce((sum, item) => sum + parseFloat(item.bandwidth || 0), 0);
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
.statistics-view {
  padding-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 24px;
  color: var(--primary);
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.statistics-summary {
  grid-column: 1 / -1;
}

.summary-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
}

.summary-icon .material-icons {
  font-size: 24px;
}

.isp-icon {
  background-color: #4caf50;
}

.cost-icon {
  background-color: #f44336;
}

.bandwidth-icon {
  background-color: #2196f3;
}

.lines-icon {
  background-color: #ff9800;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 24px;
  font-weight: 500;
  line-height: 1.2;
}

.summary-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

@media (max-width: 1200px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>