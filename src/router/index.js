import Vue from "vue";
import VueRouter from "vue-router";
//import Home from "../views/Home.vue";
import OrgBySectorYearOptions from "../components/OrgBySectorYearOptions";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: OrgBySectorYearOptions,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
