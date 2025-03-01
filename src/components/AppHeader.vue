<template>
  <header class="header elevation-2">
    <div class="header-content">
      <div class="logo">
        <img src="@/assets/logo.png" alt="LineMS Logo" />
        <h1>LineMS</h1>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-link">数据视图</router-link>
        <router-link to="/statistics" class="nav-link">统计分析</router-link>
        <router-link to="/comparison" class="nav-link">数据对比</router-link>
      </nav>
      <div class="year-selector">
        <label for="year-select">选择年份:</label>
        <select id="year-select" v-model="selectedYear" @change="changeYear">
          <option value="2025">2025年</option>
          <option value="2026">2026年</option>
        </select>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'AppHeader',
  computed: {
    ...mapState('data', ['currentYear'])
  },
  data() {
    return {
      selectedYear: '2025'
    };
  },
  created() {
    this.selectedYear = this.currentYear.toString();
  },
  methods: {
    ...mapActions('data', ['setCurrentYear']),
    changeYear() {
      this.setCurrentYear(parseInt(this.selectedYear));
    }
  }
}
</script>

<style scoped>
.header {
  background-color: var(--primary);
  color: var(--on-primary);
  padding: 0 20px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 36px;
  margin-right: 12px;
}

.logo h1 {
  font-size: 20px;
  font-weight: 500;
}

.nav {
  display: flex;
}

.nav-link {
  color: var(--on-primary);
  text-decoration: none;
  padding: 0 16px;
  height: 64px;
  display: flex;
  align-items: center;
  position: relative;
  font-weight: 500;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--secondary);
}

.year-selector {
  display: flex;
  align-items: center;
}

.year-selector label {
  margin-right: 8px;
  font-size: 14px;
}

.year-selector select {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--on-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.year-selector select:focus {
  outline: none;
  border-color: var(--secondary);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 12px 0;
  }
  
  .header {
    height: auto;
  }
  
  .nav {
    margin: 12px 0;
  }
  
  .nav-link {
    height: 48px;
  }
}
</style>