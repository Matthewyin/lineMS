import { createRouter, createWebHistory } from 'vue-router';
import DataView from '@/views/DataView.vue';
import StatisticsView from '@/views/StatisticsView.vue';
import ComparisonView from '@/views/ComparisonView.vue';

const routes = [
  {
    path: '/',
    name: 'DataView',
    component: DataView
  },
  {
    path: '/statistics',
    name: 'StatisticsView',
    component: StatisticsView
  },
  {
    path: '/comparison',
    name: 'ComparisonView',
    component: ComparisonView
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;