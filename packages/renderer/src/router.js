import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '/@/components/Home.vue'
function getChildRoutes(year) {
  var children = []
  for (var i = 1; i <= 25; i++) {
    let path = `/@/components/${year}/${i}/view.vue`
    children.push({
      name: `Day ${i}`,
      path: `${i}`,
      component: () => import(/* @vite-ignore */ path),
    })
  }
  return children
}

const routes = [
  { path: '/', name: 'Home', component: Home },
  {
    path: '/about',
    name: 'About',
    component: () => import('/@/components/About.vue'),
  }, // Lazy load route component
  {
    path: '/2021',
    name: '2021',
    component: () => import('/@/components/2021.vue'),
    children: getChildRoutes(2021),
  }, // Lazy load route component
]

export default createRouter({
  routes,
  history: createWebHashHistory(),
})
