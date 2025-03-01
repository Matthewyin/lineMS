# LineMS - 生产线管理系统 | Line Management System

## 项目简介 | Introduction

一个基于 Vue.js 的现代化数据可视化和管理系统，采用 Material Design 设计风格。

A modern Vue.js application for data visualization and management with Material Design styling.

## 主要功能 | Features

- 📊 交互式数据表格（支持排序和筛选）
- 📈 统计分析和图表展示
- 🔄 年度数据对比
- 📱 响应式 Material Design 界面
- 🔍 高级筛选功能
- 📑 分页支持
- 🎛️ 自定义列显示
- 📊 基于 Chart.js 的数据可视化

## 环境要求 | Prerequisites

开始之前，请确保已安装以下软件：
Before you begin, ensure you have installed:

- Node.js (v14.x 或更高版本 | or higher)
- npm (v6.x 或更高版本 | or higher) 或 Yarn
- Vue CLI

## 安装步骤 | Installation

1. 克隆仓库 | Clone the repository:
```bash
git clone <your-repository-url>
cd linems
```

2. 安装依赖 | Install dependencies:
```bash
npm install
# 或 | or
yarn install
```

3. 配置环境变量 | Set up environment variables:
在根目录创建 .env 文件并添加：
Create a `.env` file in the root directory and add:
```
BASE_URL=/
```

## 开发说明 | Development

启动开发服务器 | To start the development server:

```bash
npm run serve
# 或 | or
yarn serve
```

应用将在 | The application will be available at: `http://localhost:3000`

## 生产构建 | Production Build

创建生产环境构建 | To create a production build:

```bash
npm run build
# 或 | or
yarn build
```

## 项目结构 | Project Structure

```
linems/
├── src/
│   ├── assets/          # 静态资源 | Static assets
│   │   ├── styles/     # 样式文件 | Style files
│   │   └── data/       # 数据文件 | Data files
│   ├── components/      # 组件 | Components
│   │   ├── AppHeader.vue
│   │   ├── DataTable.vue
│   │   ├── Pagination.vue
│   │   ├── ColumnSelector.vue
│   │   ├── FilterPanel.vue
│   │   ├── ChartPanel.vue
│   │   └── ComparisonPanel.vue
│   ├── views/          # 视图组件 | View components
│   │   ├── DataView.vue
│   │   ├── StatisticsView.vue
│   │   └── ComparisonView.vue
│   ├── router/         # 路由配置 | Router configuration
│   │   └── index.js
│   ├── store/          # 状态管理 | State management
│   │   ├── index.js
│   │   └── modules/
│   └── utils/          # 工具函数 | Utility functions
│       ├── dataProcessor.js
│       └── chartHelper.js
├── public/
└── vue.config.js
```

## 可用脚本 | Available Scripts

- `npm run serve`: 启动开发服务器 | Starts development server
- `npm run build`: 创建生产构建 | Creates production build
- `npm run lint`: 运行代码检查 | Runs linting

## 配置说明 | Configuration

应用可通过 `vue.config.js` 进行配置：
The application can be configured through `vue.config.js`:

```javascript
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.BASE_URL || '/',
  devServer: {
    port: 3000
  }
})
```

## 功能详情 | Features in Detail

### 数据表格 | Data Table
- 可排序列 | Sortable columns
- 自定义列显示 | Custom column visibility
- 搜索功能 | Search functionality
- 分页 | Pagination

### 图表 | Charts
- 统计可视化 | Statistical visualization
- 年度对比 | Year-over-year comparison
- 动态数据更新 | Dynamic data updates

### 筛选 | Filtering
- 多条件筛选 | Multiple filter criteria
- 保存筛选预设 | Save filter presets
- 快速重置 | Quick filter reset

## 参与贡献 | Contributing

1. Fork 仓库 | Fork the repository
2. 创建特性分支 | Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 提交更改 | Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 | Push to the branch (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request | Open a Pull Request

## 许可证 | License

本项目基于 MIT 许可证 - 详见 LICENSE 文件
This project is licensed under the MIT License - see the LICENSE file for details.

## 致谢 | Acknowledgments

- Vue.js 团队提供的优秀框架 | Vue.js team for the excellent framework
- Chart.js 提供的可视化能力 | Chart.js for visualization capabilities
- Material Design 的界面设计灵感 | Material Design for UI inspiration
```

这个双语 README.md 文件：

1. 保持了清晰的层级结构
2. 中英文并列展示，方便不同语言用户阅读
3. 使用分隔符 "|" 区分中英文
4. 保留了所有重要信息
5. 技术术语同时提供中英文说明

您需要我对某个部分进行调整或补充吗？比如：
- 添加更多技术细节
- 调整中英文的展示方式
- 补充特定的项目要求