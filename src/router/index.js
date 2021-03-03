import Vue from "vue";
import VueRouter from "vue-router";
//import Home from "../views/Home.vue";
import Spending from "../views/Spending";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Spending",
    component: Spending,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
