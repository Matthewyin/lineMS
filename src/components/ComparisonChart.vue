<template>
  <div class="comparison-chart-container">
    <div v-if="loading" class="chart-loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="!hasData" class="chart-no-data">
      <p>没有符合条件的数据</p>
    </div>
    
    <div v-else :id="chartWrapperId" class="chart-wrapper">
      <canvas :id="canvasId" ref="comparisonChart"></canvas>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'ComparisonChart',
  props: {
    chartData: {
      type: Object,
      required: true
    },
    comparisonData: {
      type: Object,
      required: true
    },
    currentYear: {
      type: Number,
      required: true
    },
    nextYear: {
      type: Number,
      required: true
    },
    groupField: {
      type: String,
      required: true
    },
    compareField: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    hasData: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      comparisonChart: null,
      chartId: uuidv4(),
      renderAttempts: 0,
      darkModeMediaQuery: null
    };
  },
  computed: {
    canvasId() {
      return `comparisonChart-${this.chartId}`;
    },
    chartWrapperId() {
      return `comparison-wrapper-${this.chartId}`;
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.renderComparisonChart();
      }
    },
    groupField() {
      this.renderComparisonChart();
    }
  },
  mounted() {
    // 延迟渲染以确保DOM已完全加载
    setTimeout(() => {
      this.renderComparisonChart();
    }, 300);
    
    // 监听系统主题变化
    this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkModeMediaQuery.addEventListener('change', this.handleThemeChange);
  },
  beforeUnmount() {
    this.destroyChart();
    
    // 移除主题变化监听
    if (this.darkModeMediaQuery) {
      this.darkModeMediaQuery.removeEventListener('change', this.handleThemeChange);
    }
  },
  methods: {
    destroyChart() {
      try {
        if (this.comparisonChart) {
          this.comparisonChart.destroy();
          this.comparisonChart = null;
        }
      } catch (error) {
        console.error('销毁图表时出错:', error);
        this.comparisonChart = null;
      }
    },
    getCanvasElement() {
      return document.getElementById(this.canvasId);
    },
    renderComparisonChart() {
      this.destroyChart();
      
      if (!this.hasData) {
        return;
      }
      
      // 使用setTimeout确保DOM已完全更新
      setTimeout(() => {
        try {
          // 检查canvas元素是否存在
          const canvas = this.getCanvasElement();
          if (!canvas) {
            console.error(`Canvas元素不存在: ${this.canvasId}`);
            
            // 如果尝试次数少于3次，再次尝试渲染
            if (this.renderAttempts < 3) {
              this.renderAttempts++;
              setTimeout(() => this.renderComparisonChart(), 300);
            }
            return;
          }
          
          // 确保canvas尺寸正确
          const container = document.getElementById(this.chartWrapperId);
          if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
          }
          
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            console.error('无法获取canvas上下文');
            return;
          }
          
          // 检查数据是否为空
          if (this.chartData.labels.length === 0) {
            console.warn('没有数据可以渲染图表');
            return;
          }
          
          // 重置尝试次数
          this.renderAttempts = 0;
          
          // 确保在创建新图表前销毁旧图表
          this.destroyChart();
          
          // 初始化图表
          this.initComparisonChart(ctx);
          
        } catch (error) {
          console.error('创建图表时出错:', error);
        }
      }, 500); // 增加延迟时间，确保DOM完全加载
    },
    
    initComparisonChart(ctx) {
      // 检测是否为深色模式
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // 根据模式设置颜色
      const colors = isDarkMode ? {
        blue: {
          background: 'rgba(54, 162, 235, 0.7)',
          border: 'rgba(54, 162, 235, 1)'
        },
        red: {
          background: 'rgba(255, 99, 132, 0.7)',
          border: 'rgba(255, 99, 132, 1)'
        },
        grid: 'rgba(255, 255, 255, 0.1)',
        text: 'rgba(255, 255, 255, 0.7)'
      } : {
        blue: {
          background: 'rgba(54, 162, 235, 0.7)',
          border: 'rgba(54, 162, 235, 1)'
        },
        red: {
          background: 'rgba(255, 99, 132, 0.7)',
          border: 'rgba(255, 99, 132, 1)'
        },
        grid: 'rgba(0, 0, 0, 0.05)',
        text: 'rgba(0, 0, 0, 0.7)'
      };
      
      // 创建图表配置
      const config = {
        type: 'bar',
        data: {
          labels: this.chartData.labels,
          datasets: [
            {
              label: `${this.currentYear}年`,
              data: this.currentYear === 2025 ? this.chartData.data2025 : this.chartData.data2026,
              backgroundColor: colors.blue.background,
              borderColor: colors.blue.border,
              borderWidth: 1,
              borderRadius: 4,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
              hoverBackgroundColor: colors.blue.border,
              hoverBorderColor: colors.blue.border,
              hoverBorderWidth: 2
            },
            {
              label: `${this.nextYear}年`,
              data: this.currentYear === 2025 ? this.chartData.data2026 : this.chartData.data2025,
              backgroundColor: colors.red.background,
              borderColor: colors.red.border,
              borderWidth: 1,
              borderRadius: 4,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
              hoverBackgroundColor: colors.red.border,
              hoverBorderColor: colors.red.border,
              hoverBorderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000, // 适中的动画时间
            easing: 'easeOutQuad', // 使用更稳定的缓动函数
            delay: (context) => {
              // 为每个数据点添加延迟，创建连续动画效果
              let delay = 0;
              if (context.type === 'data' && context.mode === 'default') {
                delay = context.dataIndex * 50 + context.datasetIndex * 100;
              }
              return delay;
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: colors.text,
                padding: 20,
                font: {
                  size: 14
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              padding: 12,
              cornerRadius: 6,
              displayColors: true,
              callbacks: {
                label: (context) => {
                  const datasetLabel = context.dataset.label || '';
                  const value = context.raw;
                  const label = context.chart.data.labels[context.dataIndex];
                  const year = datasetLabel.includes(`${this.currentYear}`) ? this.currentYear.toString() : this.nextYear.toString();
                  const costField = `cost${year}`;
                  
                  // 获取对应的费用数据
                  const costValue = this.comparisonData[label] ? this.comparisonData[label][costField] : 0;
                  const formattedCost = new Intl.NumberFormat('zh-CN', { 
                    style: 'currency', 
                    currency: 'CNY',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(costValue);
                  
                  return [
                    `${datasetLabel}: ${value} 条线路`,
                    `费用: ${formattedCost}`
                  ];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: this.getFieldLabel(this.compareField),
                color: colors.text,
                font: {
                  size: 14,
                  weight: 'bold'
                },
                padding: {
                  bottom: 10
                }
              },
              grid: {
                color: colors.grid
              },
              ticks: {
                color: colors.text,
                padding: 8,
                font: {
                  size: 12
                }
              }
            },
            x: {
              title: {
                display: true,
                text: this.getFieldLabel(this.groupField),
                color: colors.text,
                font: {
                  size: 14,
                  weight: 'bold'
                },
                padding: {
                  top: 10
                }
              },
              grid: {
                color: colors.grid
              },
              ticks: {
                color: colors.text,
                padding: 8,
                font: {
                  size: 12
                }
              }
            }
          },
          hover: {
            mode: 'index',
            intersect: false
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          onClick: (event, elements) => {
            if (elements && elements.length > 0) {
              const element = elements[0];
              const index = element.index;
              const datasetIndex = element.datasetIndex;
              const label = this.chartData.labels[index];
              const dataset = config.data.datasets[datasetIndex];
              const value = dataset.data[index];
              
              console.log(`点击了 ${dataset.label} 的 ${label}，值为 ${value}`);
              
              // 简化点击动画效果，避免栈溢出
              try {
                // 这里可以添加更多交互功能，例如显示详细信息弹窗等
                this.$emit('chart-element-click', {
                  label,
                  dataset: datasetIndex === 0 ? 'current' : 'next',
                  value
                });
              } catch (err) {
                console.error('处理点击事件时出错:', err);
              }
            }
          },
          onHover: (event, elements) => {
            // 当鼠标悬停在图表元素上时，改变鼠标指针样式
            if (event && event.chart && event.chart.canvas && elements) {
              const canvas = event.chart.canvas;
              canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
            }
          }
        }
      };
      
      // 创建图表 - 不使用nextTick，直接创建
      try {
        // 使用原始的Chart.js实例，而不是全局配置的Chart
        import('chart.js/auto').then((ChartModule) => {
          const Chart = ChartModule.default;
          
          // 不再使用自定义动画效果
          // this.setupCustomAnimations(Chart);
          
          this.comparisonChart = new Chart(ctx, config);
          console.log('数据对比图表创建成功:', this.canvasId);
        }).catch(err => {
          console.error('加载Chart.js模块失败:', err);
        });
      } catch (err) {
        console.error('创建图表实例时出错:', err);
      }
    },
    getFieldLabel(field) {
      const fieldMap = {
        'count': '线路数量',
        'ISP': '运营商',
        'line_type': '线路类型',
        'payer': '付费方',
        'local': '线路本端',
        'remote': '线路对端',
        'purpose': '业务用途'
      };
      return fieldMap[field] || field;
    },
    handleThemeChange() {
      // 系统主题变化时重新渲染图表
      this.renderComparisonChart();
    }
  }
}
</script>

<style scoped>
.comparison-chart-container {
  position: relative;
  height: 400px;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-color);
  padding: 16px;
  background-color: var(--surface);
  transition: all 0.3s ease;
}

.chart-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}

.chart-loading, .chart-no-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--divider);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 