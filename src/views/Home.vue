<template>
  <div class="home">
    <b>Enter an organization code: </b>
    <input id="org-code" v-model="organization" placeholder="Enter org code" type="text">
    <br>
    <b>Enter a year (e.g. 2017)</b>
    <input id="target_year" v-model="target_year" type="number">
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
      numrecords: 0,
      running_total: 0
    }
  },
  methods: {
    fetch_data: function() {
      this.numrecords =0;
      this.running_total=0;
      let filters = "transaction_type,transaction_value_date,sector,title_narrative,budget_value_usd_sum,transaction_value,transaction_value_sum,default_currency";
      //because we have a scope inside this function
      let vm = this;
      //Hard-coded to retrieve 30k results.
      axios.get("https://iatidatastore.iatistandard.org/search/activity/?q=reporting_org_ref:"+ vm.organization + "&fl=" + filters +"&rows=30000").then(function(data) {
        console.log(data);
        //var vm.numrecords = 0
        // empty arrays to store response
        let newseries = [];
        let newcategories = [];
        //var transaction_date_series = [];
        for(let i=0; i<data.data.response.docs.length; i++){
          let curr_transaction_value = data.data.response.docs[i].transaction_value;
          let curr_transaction_date = data.data.response.docs[i].transaction_value_date;
          let curr_transaction_years = []
          if(typeof curr_transaction_date !== 'undefined') {
            for(let z=0; z<curr_transaction_date.length; z++) {
              try{
                curr_transaction_years.push(isodate(curr_transaction_date[z]).getFullYear());
                //console.log(isodate(curr_transaction_date).getFullYear())
              } catch(e) {
                console.log(e)
                continue
              }
            }
          }
          //console.log(curr_transaction_years);

          // Need to catch exception in case of parse throwing typerror
          try{
            // Get the sector name of the current ativity
            var curr_sector_name = JSON.parse(data.data.response.docs[i].sector).sector.name;
          } catch(e) {
            // Skip to next item if error
            continue
          }
          if (typeof curr_transaction_years !== 'undefined') {
            //console.log(curr_transaction_years.includes(parseInt(vm.target_year,10)))
            //console.log(typeof parseInt(vm.target_year,10))

            if(curr_transaction_years.includes(parseInt(vm.target_year,10))) {
              vm.numrecords += 1;

              // Check if the current activity's sector is already in the array of sectors
              if(newcategories.includes(curr_sector_name)) {
                // If it is, check the index of the sector
                let a = newcategories.indexOf(curr_sector_name);
                // Get the sum of all transactions in the target year
                let transaction_sum = vm.sum_transactions(curr_transaction_value, curr_transaction_date);
                // add it to total for sector
                let res = newseries[a] + transaction_sum;
                newseries[a] = res;
                //add it to running total
                vm.running_total += transaction_sum
              }
              // Else if the sector is new
              else {
                // Add the sector to the sectors array
                newcategories.push(curr_sector_name);
                if (typeof curr_transaction_value== 'undefined') {
                  newseries.push(0);
                } else {
                  let transaction_sum = vm.sum_transactions(curr_transaction_value, curr_transaction_date);
                  newseries.push(transaction_sum);
                  vm.running_total += transaction_sum
                }
              }
            }
          }
        }
        console.log(vm.running_total)
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
        console.log(newcategories)
        console.log(newseries)
      })
    },
    sum_transactions: function(values, dates) {
      let vm = this;
      let sum = 0;
      //catch instances where transaction value are undefined
      try {
        for (let i=0; i < values.length; i++) {
          if (isodate(dates[i]).getFullYear() == parseInt(vm.target_year,10)) {
            sum += values[i];
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
