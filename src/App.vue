<template>
  <div id="app" class="container-fluid">
    <div class="row">
      <nav class="col-md-2 d-none d-md-block bg-light sidebar">
        <div class="sidebar-sticky">
          <ul class="nav flex-column">
            <Inputs @query="get_query($event)"></Inputs>
            <h4><b>Organization data</b></h4>
            <li class="nav-item">
              <router-link to="/spending"
                ><span data-feather="home"></span>Spending by
                sector</router-link
              >
            </li>
            <li class="nav-item">
              <router-link to="/bycountry"
                ><span data-feather="home"></span>Spending by
                country</router-link
              >
            </li>
            <br />
            <br />
            <h4><b>Country data</b></h4>
            <li class="nav-item">
              <router-link to="/byorgincountry"
                ><span data-feather="home"></span>Spending in
                country</router-link
              >
            </li>
          </ul>
        </div>
      </nav>
      <main role="main" class="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
        <router-view
          v-bind:raw_data="input_data"
          v-bind:raw_country_data="country_data"
          v-bind:refresh_chart="refresh_chart"
          v-bind:target_years="query.target_years"
          v-bind:group_sectors="query.group_sectors"
        >
        </router-view>

        <div></div>
      </main>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
//import OrgBySectorYear from "../components/OrgBySectorYear";
//import OrgBySectorYearOptions from "../components/OrgBySectorYearOptions";
import Inputs from "./components/Inputs";

export default {
  name: "App",
  data: function () {
    return {
      input_data: {},
      country_data: {},
      organization: "",
      refresh_chart: true,
      query: "",
    };
  },
  components: {
    /*OrgBySectorYear,*/
    Inputs,
  },
  methods: {
    get_query(query) {
      this.query = query;
      //console.log(e);
      this.organization = query.organization;
      this.country = query.country;
      //console.log("timeout")
      setTimeout(() => {
        this.refresh_chart = false;
      }, 100);
      //this.refresh_chart=false;
      // number of records aggregated
      this.numrecords = 0;
      // running total of total transaction value for the period
      this.running_total = 0;
      let filters =
        "transaction_type,transaction_value_date,sector,title_narrative,budget_value_usd_sum,transaction_value,transaction_value_sum,default_currency,recipient_country_code,iati_identifier";

      let country_filters =
        "transaction_type,transaction_value_date,reporting_org_ref,reporting_org_narrative,sector,title_narrative,budget_value_usd_sum,transaction_value,transaction_value_sum,default_currency,recipient_country_code,iati_identifier";
      //because we have a scope inside this function
      let vm = this;
      //Hard-coded to retrieve 30k results.
      if (vm.current_org !== vm.organization && vm.organization) {
        axios
          .get(
            "https://iati.cloud/search/activity/?q=reporting_org_ref:" +
              vm.organization +
              "&fl=" +
              filters +
              "&rows=30000"
          )
          .then(function (data) {
            console.log("Fetched organization data");
            vm.input_data = data;
            vm.current_org = query.organization;
            vm.refresh_chart = true;
            //console.log(data);
          });
      } else {
        //vm.refresh_chart=false;
        vm.refresh_chart = true;
        console.log("Same org data");
      }

      if (vm.current_country !== vm.country && vm.country) {
        axios
          .get(
            "https://iati.cloud/search/activity?q=recipient_country_code:(" +
              vm.country +
              ")&wt=json&fl=" +
              country_filters +
              "&rows=30000"
          )
          .then(function (data) {
            console.log("Fetched country data");
            vm.country_data = data;
            vm.current_country = query.country;
            vm.refresh_chart = true;
          });
      } else {
        vm.refresh_chart = true;
        console.log("Same country data");
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100; /* Behind the navbar */
  padding: 0;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
}

.sidebar-sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 48px; /* Height of navbar */
  height: calc(100vh - 48px);
  padding-top: 0.5rem;
  overflow-x: hidden;
  overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
}

.sidebar .nav-link {
  font-weight: 500;
  color: #333;
  font-size: 1rem;
}

.sidebar .nav-link .feather {
  margin-right: 4px;
  color: #999;
}

.sidebar .nav-link.active {
  color: #007bff;
}

.sidebar .nav-link:hover .feather,
.sidebar .nav-link.active .feather {
  color: inherit;
}

.sidebar-heading {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.feather {
  width: 16px;
  height: 16px;
  vertical-align: text-bottom;
}
</style>
