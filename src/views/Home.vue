<template>
  <div class="home">
    <b>IATI data visualization</b>
    <h2>Something</h2>
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
    }
  },
  components : {
    FundingBarChart
  },
  async created() {
    //Hard-coded to retrieve 30k results.
    const {data} = await axios.get("https://iatidatastore.iatistandard.org/search/activity/?q=reporting_org_ref:GB-GOV-1&fl=sector,title_narrative,budget_value_usd_sum&rows=30000");
    console.log(data)
    console.log("Length: " + String(data.response.docs.length))

    // Loop through all items in response
    for(var i=0; i<data.response.docs.length; i++){
        // API is broken so need to convert to JSON and catch TypeError
        try{
          // Get the sector name of the current ativity
          var curr_sector_name = JSON.parse(data.response.docs[i].sector).sector.name
        } catch(e) {
          continue
        }
        // Get the current USD budget value
        var curr_budget = data.response.docs[i].budget_value_usd_sum
        // Check if the current activity's sector is already in the array of sectors
        if(this.sectors.includes(curr_sector_name)) {
          // If it is, check the index of the sector
          var a = this.sectors.indexOf(curr_sector_name);
          // Then, if a budget is specified...
          if(typeof curr_budget !== 'undefined') {
            // Add it to the budget array using the same index
            var res = this.budget[a] + curr_budget;
            this.budget[a] = res;
          }
        }
        // Else if the sector is new
        else {
          // Add the sector to the sectors array
          this.sectors.push(curr_sector_name);
          // If there is no budget, make it 0
          if(typeof curr_budget == 'undefined') {
            this.budget.push(0);
          } else {
            // Otherwise add the budget of the current activity as the initial value for the sector
            this.budget.push(data.response.docs[i].budget_value_usd_sum)
          }
        }
    }
    console.log(this.sectors)
    console.log(this.budget)

  }
//data.response.docs.sector.sector.name
//data.response.docs.budget_value_usd_sum
}
</script>
