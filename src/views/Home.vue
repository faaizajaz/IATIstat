<template>
  <div class="home">
    <b>Enter an organization code: </b>
    <input id="org-code" v-model="organization" placeholder="Enter org code" type="text">
    <br>
    <b>Enter a year (e.g. 2017)</b>
    <input id="target_year" v-model="target_year" placeholder="XXXX" type="text">
    <br>
    <button v-on:click="fetch_data">Submit</button>
    <br>
    <br>
    <p>
      <b>Example org codes:</b>
      <br>
      <i>GB-GOV-1</i>: FCDO
      <br>
      <i>XM-DAC-41301</i>: FAO
      <br>
      <br>
      <i>Searched {{ numrecords }} records.</i>
      <br>
    </p>
      <apexchart height=600 type="bar" :options="options" :series="series">

      </apexchart>
  </div>
</template>

<script>

const axios = require("axios")
var isodate = require("isodate");

export default {
  name: 'Home',
  data : function() {
    return {
      options: {
        chart: {
          id: 'fundingbarchart',
          toolbar: {
            show: true,
            tools: {
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            }
          }
        },
        xaxis: {
          categories: [],
          tickPlacement: 'on'
        },

        noData: {
          text: "Loading"
        }
      },
      series: [{
        data: []
      }],

      loaded: false,
      organization:'',
      target_year: 0,
      numrecords: 0
    }
  },
  methods: {
    fetch_data: function() {
      var filters = "transaction_type,transaction_value_date,sector,title_narrative,budget_value_usd_sum,transaction_value,transaction_value_sum,default_currency"
      //because we have a scope inside this function
      var vm = this
      //Hard-coded to retrieve 30k results.
      axios.get("https://iatidatastore.iatistandard.org/search/activity/?q=reporting_org_ref:"+ vm.organization + "&fl=" + filters +"&rows=30000").then(function(data) {
        console.log(data)
        //var vm.numrecords = 0
        // empty arrays to store response
        var newseries = [];
        var newcategories = [];
        //var transaction_date_series = [];
        for(var i=0; i<data.data.response.docs.length; i++){
          var curr_transaction_value = data.data.response.docs[i].transaction_value
          var curr_transaction_date = data.data.response.docs[i].transaction_value_date
          // Need to catch exception in case of parse throwing typerror
          try{
            // Get the sector name of the current ativity
            var curr_sector_name = JSON.parse(data.data.response.docs[i].sector).sector.name
          } catch(e) {
            // Skip to next item if error
            continue
          }
          vm.numrecords += 1;

          // Check if the current activity's sector is already in the array of sectors
          if(newcategories.includes(curr_sector_name)) {
            // If it is, check the index of the sector
            let a = newcategories.indexOf(curr_sector_name);
            // Get the sum of all transactions in the target year
            let transaction_sum = vm.sum_transactions(curr_transaction_value, curr_transaction_date)
            // add it to total for sector
            let res = newseries[a] + transaction_sum;
            newseries[a] = res;
          }
          // Else if the sector is new
          else {
            // Add the sector to the sectors array
            newcategories.push(curr_sector_name);
            if (typeof curr_transaction_value== 'undefined') {
              newseries.push(0);
            } else {
              let transaction_sum = vm.sum_transactions(curr_transaction_value, curr_transaction_date)
              newseries.push(transaction_sum)
            }
          }
        }
        // Now update the chart data
        // REMEMBER: You can't do vm.options.xaxis.categories = newcategories for some reason. The WHOLE OBJECT needs to be updated.
        vm.series = [{
          data: newseries
        }]
        vm.options = {...vm.options,...{
          xaxis: {
            categories: newcategories
          }
        }}
        // Check how many records were aggregated
        console.log(vm.numrecords)
      })
    },
    sum_transactions: function(values, dates) {
      var vm = this;
      let sum = 0;
      //catch instances where transaction value are undefined
      try {
        for (let i=0; i < values.length; i++) {
          if (isodate(dates[i]).getFullYear() == vm.target_year) {
            sum += values[i]
          }
        }
      } catch (e) {
        return 0
      }
      return sum
    }
  }

}
</script>
