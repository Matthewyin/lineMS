<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">
        <img src="../assets/logo.png" alt="LineMS Logo" class="logo-image" />
        <h1>LineMS</h1>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-link">数据视图</router-link>
        <router-link to="/statistics" class="nav-link">统计分析</router-link>
        <router-link to="/comparison" class="nav-link">数据对比</router-link>
      </nav>
      <div class="actions">
        <div class="year-selector">
          <span>选择年份: </span>
          <select v-model="selectedYear" class="year-select" @change="changeYear">
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'AppHeader',
  data() {
    return {
      availableYears: ['2025年', '2026年'],
      selectedYear: '2025年'
    };
  },
  computed: {
    ...mapState('data', ['currentYear'])
  },
  watch: {
    currentYear: {
      immediate: true,
      handler(newYear) {
        console.log('Current year changed to:', newYear);
        this.selectedYear = `${newYear}年`;
      }
    }
  },
  created() {
    // 初始化选中的年份
    this.selectedYear = `${this.currentYear}年`;
    console.log('AppHeader created, selectedYear:', this.selectedYear);
  },
  methods: {
    ...mapActions('data', ['setCurrentYear']),
    changeYear() {
      // 从字符串中提取年份数字
      const yearMatch = this.selectedYear.match(/\d+/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0]);
        console.log('Changing year to:', year);
        this.setCurrentYear(year);
      }
    }
  }
};
</script>

<style scoped>
.app-header {
  background-color: var(--primary);
  color: var(--on-primary);
  padding: 0;
  box-shadow: 0 2px 4px var(--shadow-color);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 32px;
  margin-right: 10px;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  color: var(--on-primary);
}

.nav {
  display: flex;
  align-items: center;
}

.nav-link {
  color: var(--on-primary);
  text-decoration: none;
  padding: 8px 16px;
  margin: 0 4px;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
  position: relative;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.nav-link.router-link-active {
  color: var(--on-primary);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--secondary);
}

.actions {
  display: flex;
  align-items: center;
}

.year-selector {
  display: flex;
  align-items: center;
  color: var(--on-primary);
}

.year-select {
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px 8px;
  color: var(--on-primary);
  cursor: pointer;
  margin-left: 8px;
}

@media (max-width: 768px) {
  .container {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 20px;
  }
  
  .nav {
    order: 3;
    width: 100%;
    margin-top: 10px;
    justify-content: space-between;
  }
  
  .nav-link {
    padding: 8px;
    margin: 0;
  }
  
  .year-selector span {
    display: none;
  }
}
</style>