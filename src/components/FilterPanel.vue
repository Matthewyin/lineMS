<template>
  <div class="filter-panel card">
    <h2 class="filter-panel-title">筛选条件</h2>
    <div class="filter-form">
      <div class="filter-row">
        <div class="form-group">
          <label class="form-label">ISP</label>
          <div class="select-wrapper">
            <select v-model="filters.isp" class="form-control" @change="applyFilters">
              <option value="">全部</option>
              <option v-for="option in filterOptions.isp" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Payer</label>
          <div class="select-wrapper">
            <select v-model="filters.payer" class="form-control" @change="applyFilters">
              <option value="">全部</option>
              <option v-for="option in filterOptions.payer" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Local</label>
          <div class="select-wrapper">
            <select v-model="filters.local" class="form-control" @change="applyFilters">
              <option value="">全部</option>
              <option v-for="option in filterOptions.local" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="filter-row">
        <div class="form-group">
          <label class="form-label">Remote</label>
          <div class="select-wrapper">
            <select v-model="filters.remote" class="form-control" @change="applyFilters">
              <option value="">全部</option>
              <option v-for="option in filterOptions.remote" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Purpose</label>
          <div class="select-wrapper">
            <select v-model="filters.purpose" class="form-control" @change="applyFilters">
              <option value="">全部</option>
              <option v-for="option in filterOptions.purpose" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-group filter-actions">
          <button class="btn btn-primary" @click="applyFilters">应用筛选</button>
          <button class="btn btn-text" @click="resetFilters">重置</button>
        </div>
      </div>
    </div>
    
    <div class="active-filters" v-if="hasActiveFilters">
      <h3 class="active-filters-title">已选筛选条件:</h3>
      <div class="filter-chips">
        <div 
          v-for="(value, key) in activeFilters" 
          :key="key"
          class="chip"
        >
          {{ key }}: {{ value }}
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
      filters: {
        isp: '',
        payer: '',
        local: '',
        remote: '',
        purpose: ''
      }
    };
  },
  computed: {
    filterOptions() {
      // 从数据中提取筛选选项
      const options = {
        isp: [],
        payer: [],
        local: [],
        remote: [],
        purpose: []
      };
      
      this.data.forEach(item => {
        if (item.isp && !options.isp.includes(item.isp)) {
          options.isp.push(item.isp);
        }
        if (item.payer && !options.payer.includes(item.payer)) {
          options.payer.push(item.payer);
        }
        if (item.local && !options.local.includes(item.local)) {
          options.local.push(item.local);
        }
        if (item.remote && !options.remote.includes(item.remote)) {
          options.remote.push(item.remote);
        }
        if (item.purpose && !options.purpose.includes(item.purpose)) {
          options.purpose.push(item.purpose);
        }
      });
      
      // 对选项进行排序
      for (const key in options) {
        options[key].sort();
      }
      
      return options;
    },
    activeFilters() {
      const active = {};
      for (const key in this.filters) {
        if (this.filters[key]) {
          active[key] = this.filters[key];
        }
      }
      return active;
    },
    hasActiveFilters() {
      return Object.keys(this.activeFilters).length > 0;
    }
  },
  methods: {
    applyFilters() {
      this.$emit('filter-changed', { ...this.filters });
    },
    resetFilters() {
      for (const key in this.filters) {
        this.filters[key] = '';
      }
      this.applyFilters();
    },
    removeFilter(key) {
      this.filters[key] = '';
      this.applyFilters();
    }
  }
}
</script>

<style scoped>
.filter-panel {
  margin-bottom: 24px;
}

.filter-panel-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row {
  display: flex;
  gap: 16px;
}

.filter-row .form-group {
  flex: 1;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.active-filters-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.6);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
}

.chip {
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 16px;
  padding: 0 12px;
  font-size: 14px;
  background-color: var(--primary-light);
  color: var(--on-primary);
  margin-right: 8px;
  margin-bottom: 8px;
}

.chip-remove {
  background: none;
  border: none;
  color: var(--on-primary);
  margin-left: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-actions {
    flex-direction: row;
  }
}
</style>