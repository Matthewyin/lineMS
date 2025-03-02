import { createRouter, createWebHistory } from 'vue-router';
import DataView from '@/views/DataView.vue';
import ComparisonView from '@/views/ComparisonView.vue';

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
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;