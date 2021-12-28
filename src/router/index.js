import { createRouter, createWebHashHistory } from 'vue-router'


const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/userInfo',
    name: 'UserInfo',
    component: () => import('../views/UserInfo.vue')
  },
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: () => import('../views/Login.vue')
  // },
  {
    path: '/productList',
    name: 'ProductList',
    component: () => import('../views/ProductList.vue')
  },
  {
    path: '/cartList',
    name: 'CartList',
    component: () => import('../views/CartList.vue')
  },
  {
    path: '/orderList',
    name: 'OrderList',
    component: () => import('../views/OrderList.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
