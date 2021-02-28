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
    <b>Enter a year (e.g. 2017)</b>
    <input id="target_year_1" v-model="target_year_1" type="text" />
    <br />
    <b>Enter another year to compare (e.g. 2017)</b>
    <input id="target_year_2" v-model="target_year_2" type="text" />
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
      v-bind:target_year_1="target_year_1"
      v-bind:group_sectors="false"
    ></OrgBySectorYearOptions>
  </div>
</template>

<script>
const axios = require("axios");
//import OrgBySectorYear from "../components/OrgBySectorYear";
//import OrgBySectorTwoYear from "../components/OrgBySectorTwoYear";
import OrgBySectorYearOptions from "../components/OrgBySectorYearOptions";

export default {
  name: "Home",
  data: function () {
    return {
      input_data: {},
      organization: "",
      target_year_1: "",
      target_year_2: "",
    };
  },
  components: {
    /*OrgBySectorYear,
    OrgBySectorTwoYear,*/
    OrgBySectorYearOptions
  },
  methods: {
    fetch_data: function () {
      // number of records aggregated
      this.numrecords = 0;
      // running total of total transaction value for the period
      this.running_total = 0;
      let filters =
        "transaction_type,transaction_value_date,sector,title_narrative,budget_value_usd_sum,transaction_value,transaction_value_sum,default_currency";
      //because we have a scope inside this function
      let vm = this;
      //Hard-coded to retrieve 30k results.
      axios
        .get(
          "https://iatidatastore.iatistandard.org/search/activity/?q=reporting_org_ref:" +
            vm.organization +
            "&fl=" +
            filters +
            "&rows=30000"
        )
        .then(function (data) {
          vm.input_data = data;
          console.log(data)
        });
    },
  },
};
</script>
