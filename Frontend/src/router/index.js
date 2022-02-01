import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import fb from '../utils/firebase/firebase.js'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/launch',
    name: 'Launch',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Launch.vue')
  },
  {
    path: '/lift',
    name: 'Lift',
    component: () => import(/* webpackChunkName: "about" */ '../views/Lift.vue')
  }
]



const routerConfig = {
  base: process.env.BASE_URL,
  routes
}

// change mode to history for production
if (location.hostname !== "localhost") {
  routerConfig.mode = 'history'
}

const router = new VueRouter(routerConfig)
// TODO: add back
router.beforeEach((to, from, next) => {
  if (fb.fAuth.getUser() === null && to.name !== 'Home') {
    console.log('home');
    next({ name: 'Home' });
  }
  else {
    console.log('next');
    next();
  }
})

export default router
