import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import SpendingBySector from "../views/SpendingBySector";
import SpendingByCountry from "../views/SpendingByCountry";
import Inputs from "../components/Inputs";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/spending",
    name: "SpendingBySector",
    component: SpendingBySector,
  },
  {
    path: "/bycountry",
    name: "SpendingByCountry",
    component: SpendingByCountry,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
