<template>
  <div class="app-layout">
    <!-- 左侧导航 -->
    <aside class="side-nav">
      <div class="nav-content">
        <!-- 年份选择器 -->
        <div class="nav-section">
          <h3 class="section-title">年份选择</h3>
          <div class="year-selector">
            <slot name="year-selector"></slot>
          </div>
        </div>

        <!-- 维度选择器 -->
        <div class="nav-section">
          <h3 class="section-title">数据维度</h3>
          <div class="dimension-selector">
            <slot name="dimension-selector"></slot>
          </div>
        </div>

        <!-- 筛选条件 -->
        <div class="nav-section">
          <h3 class="section-title">筛选条件</h3>
          <div class="filters">
            <slot name="filters"></slot>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 数据概览 -->
      <section class="data-overview">
        <slot name="data-overview"></slot>
      </section>

      <!-- 图表区域 -->
      <section class="charts-area">
        <slot name="charts"></slot>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: var(--background);
}

.side-nav {
  width: 15%;
  min-width: 200px;
  height: 100%;
  background-color: var(--surface);
  border-right: 1px solid var(--border-color);
  padding: 20px;
}

.nav-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.main-content {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: auto;
}

.data-overview {
  height: 20%;
  min-height: 120px;
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
}

.charts-area {
  height: 80%;
  display: flex;
  gap: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .side-nav {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .side-nav {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .main-content {
    height: auto;
  }

  .charts-area {
    flex-direction: column;
  }
}
</style>