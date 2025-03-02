import { createRouter, createWebHistory } from 'vue-router';
import DataView from '@/views/DataView.vue';
import ComparisonView from '@/views/ComparisonView.vue';
import StatisticsView from '@/views/StatisticsView.vue';

const routes = [
  {
    path: '/',
    name: 'DataView',
    component: DataView
  },
  {
    path: '/comparison',
    name: 'ComparisonView',
    component: ComparisonView
  },
  {
    path: '/statistics',
    name: 'StatisticsView',
    component: StatisticsView
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;