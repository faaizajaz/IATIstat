<template>
  <div id="app" class="container-fluid">
    <div class="row">
      <nav class="col-md-2 d-none d-md-block bg-light sidebar">
        <div class="sidebar-sticky">
          <ul class="nav flex-column">
            <Inputs @query="get_query($event)"></Inputs>
          </ul>
        </div>
      </nav>
      <main role="main" class="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
        <router-view v-bind:raw_data="input_data"
            v-bind:refresh_chart="refresh_chart"
            v-bind:target_years="query.target_years"
            v-bind:group_sectors="query.group_sectors">
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
import Inputs from "../components/Inputs";

export default {
  name: "Home",
  data: function () {
    return {
      input_data: {},
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
        "transaction_type,transaction_value_date,sector,title_narrative,budget_value_usd_sum,transaction_value,transaction_value_sum,default_currency";
      //because we have a scope inside this function
      let vm = this;
      //Hard-coded to retrieve 30k results.
      if (vm.current_org !== vm.organization) {
        axios
          .get(
            "https://iatidatastore.iatistandard.org/search/activity/?q=reporting_org_ref:" +
              vm.organization +
              "&fl=" +
              filters +
              "&rows=30000"
          )
          .then(function (data) {
            console.log("Fetched API data");
            vm.input_data = data;
            vm.current_org = query.organization;
            vm.refresh_chart = true;
            console.log(data);
          });
      } else {
        //vm.refresh_chart=false;
        vm.refresh_chart = true;
        console.log("Same data.");
      }
    },
  },
};
</script>
