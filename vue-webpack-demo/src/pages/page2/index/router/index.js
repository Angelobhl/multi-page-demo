import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/page2'),
  routes: [
    {
      path: '',
      name: 'index',
      component: () => import('../containor/Home')
    },
    {
      path: `/helloWorld`,
      name: 'helloWorld',
      component: () => import('../containor/HelloWorld')
    },
  ]
})

export default router
