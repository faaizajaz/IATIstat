import Vue from "vue";
//import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/plugins/apexcharts";
import Home from "./views/Home.vue";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(Home),
}).$mount("#app");
