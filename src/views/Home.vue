<template>
  <div class="home">
    <b>Enter an organization code: </b>
    <input
      id="org-code"
      v-model="organization"
      placeholder="Enter org code"
      type="text"
    />
    <br />
    <b>Enter years separated by commas (e.g. 2017,2018,2019)</b>
    <input id="target_years" v-model="target_years" type="text" />
    <br />
    <b>Group sectors by IATI category? </b>
    <input type="checkbox" value="test" v-model="group_sectors" />
    <br />
    <button v-on:click="fetch_data">Submit</button>
    <br />
    <br />
    <p>
      <b>Example org codes:</b>
      <br />
      <i>GB-GOV-1</i>: FCDO
      <br />
      <i>XM-DAC-41301</i>: FAO
      <br />
      <br />
    </p>
    <OrgBySectorYearOptions
      v-bind:raw_data="input_data"
      v-bind:target_years="target_years"
      v-bind:group_sectors="group_sectors"
      v-bind:refresh_chart="refresh_chart"
    ></OrgBySectorYearOptions>
  </div>
</template>

<script>
const axios = require("axios");
//import OrgBySectorYear from "../components/OrgBySectorYear";
import OrgBySectorYearOptions from "../components/OrgBySectorYearOptions";

export default {
  name: "Home",
  data: function () {
    return {
      input_data: {},
      organization: "",
      target_years: "",
      group_sectors: false,
      current_org: "",
      refresh_chart: true,
    };
  },
  components: {
    /*OrgBySectorYear,*/
    OrgBySectorYearOptions,
  },
  methods: {
    fetch_data: function () {
      //console.log("timeout")
      setTimeout(() => {this.refresh_chart=false;}, 100);
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
            vm.current_org = vm.organization;
            vm.refresh_chart = true;
            //console.log(data);
          });
      } else {
        //vm.refresh_chart=false;
        vm.refresh_chart = true;
        console.log("Same data.")
      }
    },
  },
};
</script>
