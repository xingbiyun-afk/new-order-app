import { createRouter, createWebHashHistory } from 'vue-router'
import CreateView from '../views/shared/CreateView.vue'
import MyView from '../views/shared/MyView.vue'
import TeamView from '../views/shared/TeamView.vue'
import ProductApplyCreate from '../views/work-order-budget/CreateView.vue'
import BudgetSelectView from '../views/work-order-budget/BudgetSelectView.vue'
import StoreSelectView from '../views/work-order-budget/StoreSelectView.vue'
import ProductSelectView from '../views/work-order-budget/ProductSelectView.vue'
import DetailView from '../views/work-order-budget/DetailView.vue'

const routes = [
  { path: '/', redirect: '/create' },
  { path: '/create', name: 'Create', component: CreateView, meta: { showTab: true, showHeader: true } },
  { path: '/my', name: 'My', component: MyView, meta: { showTab: true, showHeader: true } },
  { path: '/team', name: 'Team', component: TeamView, meta: { showTab: true, showHeader: true } },
  { path: '/product-apply/create', name: 'ProductApplyCreate', component: ProductApplyCreate, meta: { showTab: false, showHeader: false } },
  { path: '/product-apply/budget-select', name: 'BudgetSelect', component: BudgetSelectView, meta: { showTab: false, showHeader: false } },
  { path: '/product-apply/store-select', name: 'StoreSelect', component: StoreSelectView, meta: { showTab: false, showHeader: false } },
  { path: '/product-apply/product-select', name: 'ProductSelect', component: ProductSelectView, meta: { showTab: false, showHeader: false } },
  { path: '/product-apply/detail/:id', name: 'ProductApplyDetail', component: DetailView, meta: { showTab: false, showHeader: false } },
]
export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
