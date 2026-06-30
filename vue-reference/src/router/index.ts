import { createRouter, createWebHashHistory } from 'vue-router'
const routes = [
  { path: '/', redirect: '/create' },
  { path: '/create', name: 'Create', component: () => import('../views/shared/CreateView.vue'), meta: { showTab: true, showHeader: true } },
  { path: '/my', name: 'My', component: () => import('../views/shared/MyView.vue'), meta: { showTab: true, showHeader: true } },
  { path: '/team', name: 'Team', component: () => import('../views/shared/TeamView.vue'), meta: { showTab: true, showHeader: true } },
  { path: '/product-apply/create', name: 'ProductApplyCreate', component: () => import('../views/work-order-budget/CreateView.vue'), meta: { showTab: false, showHeader: false } },
  { path: '/product-apply/budget-select', name: 'BudgetSelect', component: () => import('../views/work-order-budget/BudgetSelectView.vue'), meta: { showTab: false, showHeader: false } },
  { path: '/product-apply/store-select', name: 'StoreSelect', component: () => import('../views/work-order-budget/StoreSelectView.vue'), meta: { showTab: false, showHeader: false } },
  { path: '/product-apply/product-select', name: 'ProductSelect', component: () => import('../views/work-order-budget/ProductSelectView.vue'), meta: { showTab: false, showHeader: false } },
  { path: '/product-apply/detail/:id', name: 'ProductApplyDetail', component: () => import('../views/work-order-budget/DetailView.vue'), meta: { showTab: false, showHeader: false } },
]
export default createRouter({ history: createWebHashHistory(), routes })
