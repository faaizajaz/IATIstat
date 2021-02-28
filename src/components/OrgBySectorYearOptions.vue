<template>
  <div>
    <i
      >Total funding amount for {{ target_year_1 }}:
      {{ format_price(running_total) }}</i
    >
    <br />
    <i>Aggregated {{ numrecords }} records.</i>
    <apexchart
      height="600"
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
  name: "OrgBySectorYearOptions",
  mixins: [viewHelpers, dataHelpers],
  props: {
    raw_data: {
      type: Object,
      default: () => null,
    },
    target_year_1: {
      type: String,
      default: "",
    },
    group_sectors : {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      options: {
        chart: {
          id: "fundingbarchart",
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
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: [],
          tickPlacement: "on",
        },
        yaxis: {
          min: 0,
        },

        noData: {
          text: "Loading",
        },
      },
      series: [
        {
          data: [],
        },
      ],
      running_total: 0,
      numrecords: 0,
    };
  },
  watch: {
    raw_data: {
      deep: true,
      immediate: true,
      handler: function () {
        this.numrecords = 0;
        this.running_total = 0;
        let newseries = [];
        let newcategories = [];
        try {
          console.log("start");
          for (let i = 0; i < this.raw_data.data.response.docs.length; i++) {
            var curr_sector_name="UNDEFINED";
            var curr_sector_cat="UNDEFINED";
            /*// get arrays of transaction values and dates for current record
            let curr_transaction_value = this.raw_data.data.response.docs[i]
              .transaction_value;
            let curr_transaction_date = this.raw_data.data.response.docs[i]
              .transaction_value_date;
            // Create a new array with only transaction years
            let curr_transaction_years = this.make_years(curr_transaction_date);
            // Need to catch exception in case of JSON.parse throwing typerror*/
            let curr_transaction_date = this.raw_data.data.response.docs[i]
              .transaction_value_date;
            // Create a new array with only transaction years
            let curr_transaction_years = this.make_years(curr_transaction_date);
            let curr_sector = "";
            try {

              // Get the sector name of the current ativity
                //curr_sector_name="Undefined sector";
                //var curr_sector_cat = "Undefined sector";

                curr_sector_name = JSON.parse(
                this.raw_data.data.response.docs[i].sector
              ).sector.name;
                curr_sector_cat = this.sector_code_to_cat(JSON.parse(
                  this.raw_data.data.response.docs[i].sector
                ).sector.code);
              //console.log(curr_sector_name)
            } catch (e) {
              console.log("Error trying to lookup sector codes at index " + i +":");
              curr_sector_cat = "Undefined sector";
              curr_sector_name="Undefined sector";
              //continue;
            }

            //console.log("getting here");

            if (this.group_sectors === true) {
              curr_sector = curr_sector_cat;
            } else {


                curr_sector = curr_sector_name;

            }

            // Make sure array fo transaction years isnt undefined
            if (typeof curr_transaction_years !== "undefined") {
              // Then check to see if an transactions were in the target year
              this.numrecords += 1;
              // Check if the current activity's sector is already in the array of sectors
              if (newcategories.includes(curr_sector)) {
                // If it is, check the index of the sector
                let a = newcategories.indexOf(curr_sector);
                /*// Get the sum of all transactions in the target year
                let transaction_sum = this.sum_transactions(
                  curr_transaction_value,
                  curr_transaction_date,
                  this.target_year_1
                );*/
                //console.log(this.sum_transactions)
                // add it to total for sector
              /*  let res = newseries[a] + transaction_sum;
                newseries[a] = res;
                //add it to running total
                this.running_total += transaction_sum;*/
              }
              // Else if the sector is new
              else {
                // Add the sector to the sectors array
                newcategories.push(curr_sector);
                //console.log("Pushed a sector: " + curr_sector)
               /* //console.log(newcategories)
                // If there is no transaction value for the current record
                if (typeof curr_transaction_value == "undefined") {
                  // make the initial value 0
                  newseries.push(0);
                } else {
                  // Otherwise add the transaction value to the total
                  let transaction_sum = this.sum_transactions(
                    curr_transaction_value,
                    curr_transaction_date,
                    this.target_year_1
                  );
                  newseries.push(transaction_sum);
                  // And add to the running total
                  this.running_total += transaction_sum;*/
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
          console.log(newcategories);
        } catch (e) {
          console.log(
            "An error was thrown. Probably because there is no input data"
          );
          //console.log(e)
        }
      },
    },
  },
};
</script>

<style lang="css" scoped></style>
