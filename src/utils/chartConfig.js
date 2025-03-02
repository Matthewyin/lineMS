import Chart from 'chart.js/auto';

// 全局配置Chart.js以避免"Cannot read properties of null (reading 'save')"错误
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;
Chart.defaults.animation = false;


// 设置合理的动画配置
Chart.defaults.animations = {
  colors: {
    duration: 1000
  },
  x: {
    duration: 1000
  },
  y: {
    duration: 1000
  }
};

// 设置合理的过渡配置
Chart.defaults.transitions = {
  active: {
    animation: {
      duration: 1000
    }
  },
  resize: {
    animation: {
      duration: 1000
    }
  },
  show: {
    animation: {
      duration: 1000
    }
  },
  hide: {
    animation: {
      duration: 1000
    }
  }
};

export default Chart;