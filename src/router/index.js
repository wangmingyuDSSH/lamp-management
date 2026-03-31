import { createRouter, createWebHistory } from 'vue-router'
import LoginWrapper from '../views/LoginWrapper.vue'
import MainWrapper from '../views/MainWrapper.vue'
import KasetsuModule from '../views/KasetsuModule.vue'
import OctoModule from '../views/OctoModule.vue'
import InventoryModule from '../views/InventoryModule.vue'

// 检查登录状态
const checkAuth = () => localStorage.getItem('isLoggedIn') === 'true'

const routes = [
  {
    path: '/',
    redirect: () => checkAuth() ? '/kasetsu' : '/Lamp'
  },
  {
    path: '/Lamp',
    name: 'Login',
    component: LoginWrapper,
    beforeEnter: (to, from, next) => {
      if (checkAuth()) {
        next('/kasetsu')
      } else {
        next()
      }
    }
  },
  {
    path: '/kasetsu',
    component: MainWrapper,
    beforeEnter: (to, from, next) => checkAuth() ? next() : next('/Lamp'),
    children: [{ path: '', component: KasetsuModule }]
  },
  {
    path: '/octo',
    component: MainWrapper,
    beforeEnter: (to, from, next) => checkAuth() ? next() : next('/Lamp'),
    children: [{ path: '', component: OctoModule }]
  },
  {
    path: '/inventory',
    component: MainWrapper,
    beforeEnter: (to, from, next) => checkAuth() ? next() : next('/Lamp'),
    children: [{ path: '', component: InventoryModule }]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
