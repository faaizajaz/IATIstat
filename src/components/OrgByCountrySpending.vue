<template>
  <div>
    <apexchart
      type="bar"
      :options="options"
      :series="series"
    ></apexchart>
  </div>
</template>

<script>

const isodate = require("isodate");
import { viewHelpers } from "../mixins/viewHelpers.js";
import { dataHelpers } from "../mixins/dataHelpers.js";

export default {

  name: 'OrgByCountrySpending',
  mixins: [viewHelpers, dataHelpers],

  props: {
    raw_data: {
      type: Object,
      default: () => null,
    },
    target_years: {
      type: String,
      default: "",
    },
    refresh_chart: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      options: {
        chart: {
          width: '100%',
          id: "countrybarchart",
          toolbar: {
            show: true,
            tools: {
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
          },
          animations: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        plotOptions: {
          bar: {
            horizontal: true
          }
        },
        xaxis: {
          categories: [],
          tickPlacement: "on",
          labels: {
            formatter: function (value) {
              let val = (value/1).toFixed(0).replace(",", ".");
              return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
          }
        },
        yaxis: {
          min: 0,
        },

        noData: {
          text: "Loading",
        },
      },
      series: [],
      running_total: 0,
      numrecords: 0,
    };
  },

  watch: {
    check_for_update:{
      handler: function() {
        this.numrecords = 0;
        this.running_total = 0;
        this.series = [];
        let newseries = {};
        let newcategories = [];
        //make array of target years
        let target_years_array = this.target_years.split(",");
        for (let year in target_years_array) {
          newseries[target_years_array[year]] = [];
          //console.log(target_years_array)
        }

        try {
          console.log("start country");
          for (let i = 0; i < this.raw_data.data.response.docs.length; i++) {
            var curr_country_code = "UNDEFINED";

            let curr_transaction_value = this.raw_data.data.response.docs[i]
              .transaction_value;
            let curr_transaction_date = this.raw_data.data.response.docs[i]
              .transaction_value_date;
            // Create a new array with only transaction years
            let curr_transaction_years = this.make_years(curr_transaction_date);

            try {
              curr_country_code =
                this.raw_data.data.response.docs[i].recipient_country_code[0];

              //console.log(curr_country_code)
            } catch (e) {
              //console.log("Error trying to lookup sector codes at index " + i +":");

              curr_country_code = "Undefined country";
              //console.log("oculdng get cc")
              //continue;
            }

            // Make sure array fo transaction years isnt undefined
            if (typeof curr_transaction_years !== "undefined") {
              // Then check to see if an transactions were in the target year
              this.numrecords += 1;
              // Check if the current activity's sector is already in the array of sectors
              if (newcategories.includes(curr_country_code)) {
                // If it is, check the index of the sector
                let a = newcategories.indexOf(curr_country_code);
                for (let year in target_years_array) {
                  let q = this.sum_transactions(
                    curr_transaction_value,
                    curr_transaction_date,
                    target_years_array[year]
                  );
                  let res = newseries[target_years_array[year]][a] + q;
                  newseries[target_years_array[year]][a] = res;
                }
              }
              // Else if the sector is new
              else {
                // Add the sector to the sectors array
                newcategories.push(curr_country_code);
                for (let year in target_years_array) {
                  let q = this.sum_transactions(
                    curr_transaction_value,
                    curr_transaction_date,
                    target_years_array[year]
                  );
                  newseries[target_years_array[year]].push(q);
                }
              }
            }
          }

          // Now update the chart data
          // REMEMBER: You can't do vm.options.xaxis.categories = newcategories for some reason. The WHOLE OBJECT needs to be updated.
          /*this.series = [
            {
              data: newseries,
            },
          ];*/
          this.options = {
            ...this.options,
            ...{
              xaxis: {
                categories: newcategories,
              },
            },
          };

          try {
            for (let year in target_years_array) {
              let tmp = {
                name: target_years_array[year],
                data: newseries[target_years_array[year]],
              };
              this.series.push(tmp);
            }
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(
            "An error was thrown. Probably because there is no input data"
          );
          console.log(e)
        }

      }
    }
  },

  computed: {
    check_for_update() {
      return this.refresh_chart;
    },
  },

  created: function () {
    this.numrecords = 0;
        this.running_total = 0;
        this.series = [];
        let newseries = {};
        let newcategories = [];
        //make array of target years
        let target_years_array = this.target_years.split(",");
        for (let year in target_years_array) {
          newseries[target_years_array[year]] = [];
          //console.log(target_years_array)
        }

        try {
          console.log("start country");
          for (let i = 0; i < this.raw_data.data.response.docs.length; i++) {
            var curr_country_code = "UNDEFINED";

            let curr_transaction_value = this.raw_data.data.response.docs[i]
              .transaction_value;
            let curr_transaction_date = this.raw_data.data.response.docs[i]
              .transaction_value_date;
            // Create a new array with only transaction years
            let curr_transaction_years = this.make_years(curr_transaction_date);

            try {
              curr_country_code =
                this.raw_data.data.response.docs[i].recipient_country_code[0];

              //console.log(curr_country_code)
            } catch (e) {
              //console.log("Error trying to lookup sector codes at index " + i +":");

              curr_country_code = "Undefined country";
              //console.log("oculdng get cc")
              //continue;
            }

            // Make sure array fo transaction years isnt undefined
            if (typeof curr_transaction_years !== "undefined") {
              // Then check to see if an transactions were in the target year
              this.numrecords += 1;
              // Check if the current activity's sector is already in the array of sectors
              if (newcategories.includes(curr_country_code)) {
                // If it is, check the index of the sector
                let a = newcategories.indexOf(curr_country_code);
                for (let year in target_years_array) {
                  let q = this.sum_transactions(
                    curr_transaction_value,
                    curr_transaction_date,
                    target_years_array[year]
                  );
                  let res = newseries[target_years_array[year]][a] + q;
                  newseries[target_years_array[year]][a] = res;
                }
              }
              // Else if the sector is new
              else {
                // Add the sector to the sectors array
                newcategories.push(curr_country_code);
                for (let year in target_years_array) {
                  let q = this.sum_transactions(
                    curr_transaction_value,
                    curr_transaction_date,
                    target_years_array[year]
                  );
                  newseries[target_years_array[year]].push(q);
                }
              }
            }
          }

          // Now update the chart data
          // REMEMBER: You can't do vm.options.xaxis.categories = newcategories for some reason. The WHOLE OBJECT needs to be updated.
          /*this.series = [
            {
              data: newseries,
            },
          ];*/
          this.options = {
            ...this.options,
            ...{
              xaxis: {
                categories: newcategories,
              },
            },
          };

          try {
            for (let year in target_years_array) {
              let tmp = {
                name: target_years_array[year],
                data: newseries[target_years_array[year]],
              };
              this.series.push(tmp);
            }
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(
            "An error was thrown. Probably because there is no input data"
          );
          console.log(e)
        }


  }

}
</script>

<style lang="css" scoped>
</style>
