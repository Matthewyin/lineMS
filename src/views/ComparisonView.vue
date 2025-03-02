<template>
  <div class="comparison-view">
    <h1 class="page-title">数据对比</h1>
    
    <div class="comparison-layout">
      <!-- 左侧筛选面板 -->
      <div class="filter-sidebar">
        <filter-panel 
          :data="combinedData" 
          @filter-changed="handleFilterChange"
        />
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="content-area">
        <comparison-panel 
          :data2025="filteredData2025"
          :data2026="filteredData2026"
          :filters="filters"
          @chart-element-click="handleChartElementClick"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import FilterPanel from '@/components/FilterPanel.vue';
import ComparisonPanel from '@/components/ComparisonPanel.vue';
import { compareData } from '@/units/dataProcessor';

export default {
  name: 'ComparisonView',
  components: {
    FilterPanel,
    ComparisonPanel
  },
  data() {
    return {
      filters: {},
      groupBy: 'ISP',
      compareField: 'cost_year'
    };
  },
  computed: {
    ...mapState('data', ['currentYear']),
    ...mapGetters('data', ['data2025', 'data2026']),
    combinedData() {
      return [...this.data2025, ...this.data2026];
    },
    filteredData2025() {
      return this.data2025.filter(item => {
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
    filteredData2026() {
      return this.data2026.filter(item => {
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
    comparisonData() {
      return compareData(this.filteredData2025, this.filteredData2026, this.groupBy, this.compareField);
    }
  },
  methods: {
    handleFilterChange(filters) {
      this.filters = filters;
    },
    handleGroupByChange(value) {
      this.groupBy = value;
    },
    handleCompareFieldChange(value) {
      this.compareField = value;
    },
    handleChartElementClick(event) {
      console.log('图表元素被点击:', event);
      // 这里可以添加更多处理逻辑，例如显示详细信息弹窗
      // 或者根据点击的元素进行数据筛选等
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

.comparison-layout {
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

@media (max-width: 1200px) {
  .comparison-layout {
    flex-direction: column;
  }
  
  .filter-sidebar {
    width: 100%;
  }
}
</style>