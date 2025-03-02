<template>
  <div class="statistics-view">
    <h1 class="page-title">{{ currentYear }}年统计分析</h1>
    
    <div class="statistics-layout">
      <!-- 左侧筛选面板 -->
      <div class="filter-sidebar">
        <filter-panel 
          :data="currentData" 
          @filter-changed="handleFilterChange"
        />
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="content-area">
        <div class="statistics-summary card">
          <h2 class="summary-title">数据概览</h2>
          <div class="summary-cards">
            <div class="summary-card">
              <div class="summary-icon isp-icon">
                <span class="material-icons">business</span>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ uniqueValues.ISP.length }}</div>
                <div class="summary-label">ISP数量</div>
              </div>
            </div>
            
            <div class="summary-card">
              <div class="summary-icon cost-icon">
                <span class="material-icons">payments</span>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ formatCurrency(totalCost) }}</div>
                <div class="summary-label">总费用</div>
              </div>
            </div>
            
            <div class="summary-card">
              <div class="summary-icon remote-icon">
                <span class="material-icons">location_on</span>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ uniqueValues.remote.length }}</div>
                <div class="summary-label">线路对端数量</div>
              </div>
            </div>
            
            <div class="summary-card">
              <div class="summary-icon purpose-icon">
                <span class="material-icons">category</span>
              </div>
              <div class="summary-content">
                <div class="summary-value">{{ uniqueValues.purpose.length }}</div>
                <div class="summary-label">业务用途数量</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="statistics-charts">
          <div class="charts-row">
            <chart-panel 
              title="按运营商统计"
              :data="filteredData"
              group-by="ISP"
              value-field="cost_year"
              :filters="filters"
              ref="ispChart"
            />
            
            <chart-panel 
              title="按线路类型统计"
              :data="filteredData"
              group-by="line_type"
              value-field="cost_year"
              :filters="filters"
            />
          </div>
          
          <div class="charts-row">
            <chart-panel 
              title="按付费方统计"
              :data="filteredData"
              group-by="payer"
              value-field="cost_year"
              :filters="filters"
            />
            
            <chart-panel 
              title="按业务用途统计"
              :data="filteredData"
              group-by="purpose"
              value-field="cost_year"
              :filters="filters"
            />
          </div>
          
          <div class="charts-row">
            <chart-panel 
              title="按线路本地统计"
              :data="filteredData"
              group-by="local"
              value-field="cost_year"
              :filters="filters"
            />
            
            <chart-panel 
              title="按线路对端统计"
              :data="filteredData"
              group-by="remote"
              value-field="cost_year"
              :filters="filters"
            />
          </div>
        </div>
      </div>
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
          if (Array.isArray(this.filters[key]) && this.filters[key].length > 0) {
            if (!this.filters[key].includes(item[key])) {
              return false;
            }
          }
        }
        return true;
      });
    },
    uniqueValues() {
      const result = {
        ISP: [],
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
      return this.filteredData.reduce((sum, item) => sum + parseFloat(item.cost_year || 0), 0);
    }
  },
  mounted() {
    // 确保图表在页面加载后正确渲染
    setTimeout(() => {
      if (this.$refs.ispChart) {
        this.$refs.ispChart.renderChart();
      }
    }, 500);
  },
  methods: {
    handleFilterChange(filters) {
      this.filters = filters;
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

.statistics-layout {
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

.statistics-summary {
  margin-bottom: 24px;
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
  background-color: var(--surface);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
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

.remote-icon {
  background-color: #2196f3;
}

.purpose-icon {
  background-color: #ff9800;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 24px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--text-primary);
}

.summary-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.statistics-charts {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.charts-row {
  display: flex;
  gap: 24px;
}

.charts-row > * {
  flex: 1;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .statistics-layout {
    flex-direction: column;
  }
  
  .filter-sidebar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .charts-row {
    flex-direction: column;
  }
  
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