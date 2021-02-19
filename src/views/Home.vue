<template>
  <div class="home">
    <b>Enter an organization code: </b>
    <input id="org-code" v-model="organization" placeholder="Enter org code" type="text">
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
    </p>
      <apexchart height=600 type="bar" :options="options" :series="series">

      </apexchart>
  </div>
</template>

<script>

const axios = require("axios")
//var isodate = require("isodate");

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
      organization:''
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
        var numrecords = 0
        // empty arrays to store response
        var newseries = [];
        var newcategories = [];
        //var transaction_date_series = [];
        for(var i=0; i<data.data.response.docs.length; i++){
          // Check that required fields are available in each item
          try{
            // Get the sector name of the current ativity
            var curr_sector_name = JSON.parse(data.data.response.docs[i].sector).sector.name
            // Get the current USD budget value
            var curr_budget = data.data.response.docs[i].budget_value_usd_sum

          } catch(e) {
            // Skip to next item if error
            continue
          }
          numrecords += 1;

          //console.log(data.data.response.docs[i].transaction_type)
          //console.log(data.data.response.docs[i].transaction_value_date)
          //console.log(data.data.response.docs[i].transaction_value_usd)

          // Check if the current activity's sector is already in the array of sectors
          if(newcategories.includes(curr_sector_name)) {
            // If it is, check the index of the sector
            var a = newcategories.indexOf(curr_sector_name);
            // Then, if a budget is specified...
            if(typeof curr_budget !== 'undefined') {
              // Add it to the budget array using the same index
              var res = newseries[a] + curr_budget;
              newseries[a] = res;
            }
          }
          // Else if the sector is new
          else {
            // Add the sector to the sectors array
            newcategories.push(curr_sector_name);
            // If there is no budget, make it 0
            if(typeof curr_budget == 'undefined') {
              newseries.push(0);
            } else {
              // Otherwise add the budget of the current activity as the initial value for the sector
              newseries.push(data.data.response.docs[i].budget_value_usd_sum)

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
        }
        }
        // Check how many records were aggregated
        console.log(numrecords)
      })
    }
  }

}
</script>
