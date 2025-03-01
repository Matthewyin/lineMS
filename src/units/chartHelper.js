/**
 * 生成随机颜色
 * @param {Number} alpha 透明度
 * @returns {String} 颜色字符串
 */
export const getRandomColor = (alpha = 1) => {
  const colors = [
    `rgba(75, 192, 192, ${alpha})`,
    `rgba(54, 162, 235, ${alpha})`,
    `rgba(153, 102, 255, ${alpha})`,
    `rgba(255, 159, 64, ${alpha})`,
    `rgba(255, 99, 132, ${alpha})`,
    `rgba(255, 206, 86, ${alpha})`,
    `rgba(231, 233, 237, ${alpha})`,
    `rgba(156, 39, 176, ${alpha})`,
    `rgba(33, 150, 243, ${alpha})`,
    `rgba(76, 175, 80, ${alpha})`,
    `rgba(255, 152, 0, ${alpha})`,
    `rgba(121, 85, 72, ${alpha})`,
    `rgba(96, 125, 139, ${alpha})`
  ];
  
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
};

/**
 * 生成柱状图配置
 * @param {Object} data 图表数据
 * @param {String} label 数据标签
 * @param {String} yAxisLabel Y轴标签
 * @returns {Object} 图表配置
 */
export const getBarChartConfig = (data, label, yAxisLabel) => {
  const backgroundColors = data.labels.map(() => getRandomColor(0.7));
  
  return {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: label,
        data: data.values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisLabel
          }
        }
      }
    }
  };
};

/**
 * 生成饼图配置
 * @param {Object} data 图表数据
 * @returns {Object} 图表配置
 */
export const getPieChartConfig = (data) => {
  const backgroundColors = data.labels.map(() => getRandomColor(0.7));
  
  return {
    type: 'pie',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  };
};

/**
 * 生成对比图配置
 * @param {Object} data1 第一组数据
 * @param {Object} data2 第二组数据
 * @param {String} label1 第一组标签
 * @param {String} label2 第二组标签
 * @param {String} yAxisLabel Y轴标签
 * @returns {Object} 图表配置
 */
export const getComparisonChartConfig = (data1, data2, label1, label2, yAxisLabel) => {
  return {
    type: 'bar',
    data: {
      labels: data1.labels,
      datasets: [
        {
          label: label1,
          data: data1.values,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 