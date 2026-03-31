import { createRouter, createWebHistory } from 'vue-router'
import KasetsuModule from '../views/KasetsuModule.vue'
import OctoModule from '../views/OctoModule.vue'
import InventoryModule from '../views/InventoryModule.vue'

const routes = [
  {
    path: '/',
    redirect: '/kasetsu'
  },
  {
    path: '/Lamp',
    name: 'Login',
    component: { template: '<div></div>' }
  },
  {
    path: '/kasetsu',
    name: 'Kasetsu',
    component: KasetsuModule
  },
  {
    path: '/octo',
    name: 'Octo',
    component: OctoModule
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: InventoryModule
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
