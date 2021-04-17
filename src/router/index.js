import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import SpendingBySector from "../views/SpendingBySector";
import SpendingByCountry from "../views/SpendingByCountry";
import Inputs from "../components/Inputs";
import CountryByOrgSpending from "../views/CountryByOrg";

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
  {
    path: "/byorgincountry",
    name: "CountryByOrgSpending",
    component: CountryByOrgSpending,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
