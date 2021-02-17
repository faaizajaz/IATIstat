<template>
  <div class="home">
    <b>Funding by sector</b>
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
      <FundingBarChart :label="sectors" :chart-data="budget"></FundingBarChart>
  </div>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from '@/components/HelloWorld.vue'
//import Chart from 'chart.js'
import FundingBarChart from '@/components/FundingBarChart'
const axios = require("axios")

export default {
  name: 'Home',
  data : ()=> {
    return {
      sectors : ["A"],
      budget: [0],
      status:'',
      organization: ''
    }
  },
  components : {
    FundingBarChart
  },
  methods: {
    fetch_data: async function() {
      //because we have a scope inside this function
      var vm = this
      //Hard-coded to retrieve 30k results.
      await axios.get("https://iatidatastore.iatistandard.org/search/activity/?q=reporting_org_ref:"+ vm.organization + "&fl=sector,title_narrative,budget_value_usd_sum&rows=30000").then(function(data) {
        console.log(data);
        for(var i=0; i<data.data.response.docs.length; i++){
          // API is broken so need to convert to JSON and catch TypeError
          try{
            // Get the sector name of the current ativity
            var curr_sector_name = JSON.parse(data.data.response.docs[i].sector).sector.name
          } catch(e) {
            continue
          }
          // Get the current USD budget value
          var curr_budget = data.data.response.docs[i].budget_value_usd_sum
          // Check if the current activity's sector is already in the array of sectors
          if(vm.sectors.includes(curr_sector_name)) {
            // If it is, check the index of the sector
            var a = vm.sectors.indexOf(curr_sector_name);
            // Then, if a budget is specified...
            if(typeof curr_budget !== 'undefined') {
              // Add it to the budget array using the same index
              var res = vm.budget[a] + curr_budget;
              vm.budget[a] = res;
            }
          }
          // Else if the sector is new
          else {
            // Add the sector to the sectors array
            vm.sectors.push(curr_sector_name);
            // If there is no budget, make it 0
            if(typeof curr_budget == 'undefined') {
              vm.budget.push(0);
            } else {
              // Otherwise add the budget of the current activity as the initial value for the sector
              vm.budget.push(data.data.response.docs[i].budget_value_usd_sum)
            }
          }
      }

      })
    }
  }

}
</script>
