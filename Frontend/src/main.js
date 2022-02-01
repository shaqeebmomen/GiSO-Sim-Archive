import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueMq from 'vue-mq'
// import { Carousel } from 'buefy'
import Buefy from "buefy";
import 'buefy/dist/buefy.css'


// Require the main Sass manifest file
require('./assets/sass/main.scss');


Vue.config.productionTip = false

Vue.use(VueMq, {
  breakpoints: {
    sm: 1024,
    md: 1280,
    lg: 1366,
  },
  defaultBreakpoint: 'sm' // customize this for SSR
})

// Vue.use(Carousel);
// Vue.use(Toast)
Vue.use(Buefy)




new Vue({
  router,
  store,
  // VueMq,
  mounted() {
  },
  render: h => h(App)
}).$mount('#app')
