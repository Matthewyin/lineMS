import Chart from 'chart.js/auto';

// 重置为简单的全局配置
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

// 基本事件处理
Chart.defaults.events = ['mousemove', 'mouseout', 'click'];

// 基本交互行为
Chart.defaults.interaction = {
  mode: 'nearest',
  intersect: true
};

// 基本提示框配置
Chart.defaults.plugins.tooltip = {
  enabled: true,
  position: 'nearest',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  titleColor: 'white',
  bodyColor: 'white',
  padding: 10,
  displayColors: true
};

export default Chart; 