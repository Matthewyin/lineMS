# LineMS - 线路管理系统

## 概述

LineMS 是一个基于 Vue.js 的 Web 应用程序，用于管理和可视化线路数据。它提供了数据查看、比较、统计分析和交互式过滤等功能。该应用程序利用 Vue 3、Vuex 进行状态管理、Vue Router 进行导航以及 ECharts 进行数据可视化。它支持响应式设计，并提供可定制的主题选项。

## 功能特性

*   **数据视图：** 以表格形式显示线路数据，具有以下功能：
    *   按多个条件进行过滤（运营商、线路类型、付费方、本端/对端、业务用途、带宽）。
    *   可自定义列显示。
    *   分页。
    *   跨所有数据字段搜索。
    *   排序（运营商、线路类型、付费方和业务用途的预定义规则）。
*   **数据对比：** 比较两年（目前为 2025 年和 2026 年）的数据，具有：
    *   过滤。
    *   按各种字段分组（运营商、线路类型、付费方、本端）。
    *   显示线路数量和成本差异的汇总表。
    *   用于可视化比较的交互式图表（饼图和条形图）。
    *   详细的变化跟踪（新增、移除、费用变化、带宽变化的线路）。
*   **统计分析：** 使用交互式图形提供线路拓扑的直观表示：
    *   节点代表本端和对端。
    *   连线代表连接，具有线路类型和多重连接的可视化提示。
    *   交互式过滤。
    *   显示详细线路信息的工具提示。
    *   全屏模式。
*   **主题：** 实现了基本的主题设置。主题可以在本地存储中设置和保存。
*   **响应式设计：** 适应不同的屏幕尺寸（手机、平板电脑、桌面）。

## 项目结构

该项目遵循标准的 Vue CLI 项目结构：

*   **`src/`**: 包含主要的应用代码。
    *   **`components/`**: 可复用的 Vue 组件。
        *   `AppHeader.vue`: 应用程序页眉，包含导航和年份选择。
        *   `DataTable.vue`: 以表格形式显示数据，具有分页、过滤和列选择功能。
        *   `FilterPanel.vue`: 提供用于过滤数据的侧边栏。
        *   `ComparisonPanel.vue`: 处理数据比较逻辑和显示。
        *   `ComparisonChart.vue`: 渲染比较图表（饼图和条形图）。
        *   `ComparisonSummaryTable.vue`: 显示比较数据的汇总表。
        *   `ComparisonChangeDetail.vue`: 显示两年之间的详细变化。
        *   `StatisticsChart.vue`: 渲染交互式线路拓扑图。
        *   `Pagination.vue`: 处理表格分页。
        *   `ColumnSelector.vue`: 允许用户选择要在数据表中显示的列。
    *   **`views/`**: 代表不同视图/路由的顶级组件。
        *   `DataView.vue`: 主数据视图。
        *   `ComparisonView.vue`: 数据比较视图。
        *   `StatisticsView.vue`: 统计分析视图。
    *   **`store/`**: Vuex store 模块。
        *   `modules/`:
            *   `data.js`: 管理数据加载和当前年份选择。
            *   `filter.js`: 管理过滤器状态（在提供的代码中未主动使用，但已设置）。
            *   `settings.js`: 管理应用程序设置（每页显示、选定的列、主题）。
        *   `index.js`: 创建 Vuex store。
    *   **`router/`**: Vue Router 配置。
        *   `index.js`: 定义应用程序路由。
    *   **`assets/`**: 静态资源。
        *   `data/`: 包含 JSON 数据文件 (`2025.json`, `2026.json`)。
    *   **`units/`**: 实用函数。
        *   `dataProcessor.js`: 用于过滤、分组和比较数据的函数。
        *   `chartHelper.js`: 用于生成 ECharts 配置的函数。
    *   **`App.vue`**: 根 Vue 组件。
    *   **`main.js`**: 应用程序入口点。

## 安装和运行

1.  **先决条件：** 确保已安装 Node.js 和 npm（或 Yarn）。

2.  **克隆仓库：**
    ```bash
    git clone <仓库地址>
    cd <项目目录>
    ```

3.  **安装依赖：**
    ```bash
    npm install
    ```
    或
    ```bash
    yarn install
    ```

4.  **运行开发服务器：**
    ```bash
    npm run serve
    ```
    或
    ```bash
    yarn serve
    ```

    这将启动开发服务器，通常在 `http://localhost:3000`。

## 数据

应用程序使用位于 `src/assets/data/` 中的 JSON 数据文件。目前，它包含 2025 年 (`2025.json`) 和 2026 年 (`2026.json`) 的数据。JSON 数据的结构假定为一个对象数组，其中每个对象代表一条线路，并具有以下键：

*   `id`: 线路的唯一标识符。
*   `ISP`: 服务提供商（例如，“中国电信”，“中国联通”）。
*   `line_type`: 线路类型（例如，“MSTP”，“MPLS VPN”）。
*   `bandwidth`: 线路带宽（例如，“100Mbps”，“2G”）。
*   `payer`: 线路的付费方（例如，“总部”，“分公司”）。
*   `cost_year`: 线路的年度费用。
*   `local`: 线路的本端。
*   `remote`: 线路的对端。
*   `purpose`: 线路的用途（例如，“生产”，“办公”）。
*   `contract_end`：合同结束日期。

## 状态管理 (Vuex)

应用程序使用 Vuex 进行状态管理。store 被组织成模块：

*   **`data`**: 管理加载的数据（2025 年和 2026 年）和当前选择的年份。
*   **`filter`**: 提供管理过滤器的结构，尽管 `FilterPanel.vue` 中的实现直接触发事件，而不是使用 Vuex mutations/actions 进行过滤器更改。
*   **`settings`**: 管理应用程序范围的设置，包括每页显示的项目数、选定的列和主题。

## 路由 (Vue Router)

Vue Router 用于在不同视图之间导航：

*   `/`: `DataView` (数据表格)
*   `/comparison`: `ComparisonView` (数据对比)
*   `/statistics`: `StatisticsView` (统计分析)

## 主题

`settings.js` Vuex 模块处理主题持久性。它在初始化时从 `localStorage` 检索主题，并在主题更改时保存它。`App.vue` 文件为默认亮色主题定义了 CSS 变量。`settings.js` 中的 `setTheme` 操作更新 `documentElement` 上的 `data-theme` 属性，可用于更高级的主题切换（尽管在提供的 CSS 中未实现完整的暗色主题）。

## 进一步开发

*   **暗色主题：** 使用 CSS 变量和 `data-theme` 属性实现完整的暗色主题。
*   **后端集成：** 将应用程序连接到后端 API 以动态获取和更新数据。
*   **用户身份验证：** 添加用户身份验证和授权。
*   **数据编辑：** 允许用户编辑线路数据。
*   **数据导出：** 实现以各种格式（CSV、Excel 等）导出数据的功能。
*   **高级过滤：** 增强过滤功能（例如，带宽和成本的范围过滤器，日期过滤器）。
*   **更多图表类型：** 添加更多图表类型以进行数据可视化。
*   **测试：** 添加单元测试和端到端测试。
*   **国际化：** 添加多语言支持 (i18n)。
*   **重构过滤器逻辑：** 可以重构 `FilterPanel.vue` 中的过滤器逻辑，以利用 `filter.js` Vuex 模块进行集中式过滤器状态管理。
