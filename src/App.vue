<template>
  <div class="app">
    <app-header />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue';

export default {
  name: 'App',
  components: {
    AppHeader
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

:root {
  /* 主题变量 */
  --primary: #ffffff;
  --primary-dark: #f0f0f0;
  --primary-light: #ffffff;
  --secondary: #03dac6;
  --secondary-dark: #018786;
  --background: #f5f5f5;
  --surface: #ffffff;
  --error: #b00020;
  --success: #4caf50;
  --warning: #ff9800;
  --info: #2196f3;
  --on-primary: #000000;
  --on-secondary: #000000;
  --on-background: #000000;
  --on-surface: #000000;
  --on-error: #ffffff;
  --on-success: #ffffff;
  --on-warning: #000000;
  --on-info: #ffffff;
  --border-color: rgba(0, 0, 0, 0.12);
  --text-primary: rgba(0, 0, 0, 0.87);
  --text-secondary: rgba(0, 0, 0, 0.6);
  --text-hint: rgba(0, 0, 0, 0.38);
  --divider: rgba(0, 0, 0, 0.12);
  --shadow-color: rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: var(--background);
  color: var(--on-background);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.card {
  background-color: var(--surface);
  border-radius: 4px;
  box-shadow: 0 2px 4px var(--shadow-color);
  padding: 16px;
  margin-bottom: 16px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.elevation-1 {
  box-shadow: 0 2px 1px -1px var(--shadow-color), 0 1px 1px 0 var(--shadow-color), 0 1px 3px 0 var(--shadow-color);
}

.elevation-2 {
  box-shadow: 0 3px 1px -2px var(--shadow-color), 0 2px 2px 0 var(--shadow-color), 0 1px 5px 0 var(--shadow-color);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  height: 36px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: var(--primary);
  color: var(--on-primary);
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--secondary);
  color: var(--on-secondary);
}

.btn-secondary:hover {
  background-color: var(--secondary-dark);
}

.btn-text {
  background-color: transparent;
  color: var(--primary);
}

.btn-text:hover {
  background-color: rgba(98, 0, 238, 0.04);
}

.chip {
  display: inline-flex;
  align-items: center;
  height: 32px;
  border-radius: 16px;
  padding: 0 12px;
  font-size: 14px;
  background-color: #e0e0e0;
  margin-right: 8px;
  margin-bottom: 8px;
}

.chip-active {
  background-color: var(--primary-light);
  color: var(--on-primary);
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.form-control {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition: border-color 0.3s;
  background-color: var(--surface);
  color: var(--text-primary);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: '▼';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 12px;
  color: var(--text-secondary);
}

select.form-control {
  appearance: none;
  padding-right: 30px;
}

.grid {
  display: grid;
  grid-gap: 16px;
}

.grid-2 {
  grid-template-columns: repeat(auto-fill, minmax(calc(50% - 16px), 1fr));
}

.grid-3 {
  grid-template-columns: repeat(auto-fill, minmax(calc(33.333% - 16px), 1fr));
}

.grid-4 {
  grid-template-columns: repeat(auto-fill, minmax(calc(25% - 16px), 1fr));
}

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
}
</style>