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

export default {
  name: "OrgBySectorYear",
  props: {
    raw_data: {
      type: Object,
      default: () => null,
    },
    target_year_1: {
      type: String,
      default: "",
    },
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
          for (let i = 0; i < this.raw_data.data.response.docs.length; i++) {
            // get arrays of transaction values and dates for current record
            let curr_transaction_value = this.raw_data.data.response.docs[i]
              .transaction_value;
            let curr_transaction_date = this.raw_data.data.response.docs[i]
              .transaction_value_date;
            // Create a new array with only transaction years
            let curr_transaction_years = [];
            // First check that transaction date array is not undefined
            if (typeof curr_transaction_date !== "undefined") {
              // then, loop through the transaction dates array
              for (let z = 0; z < curr_transaction_date.length; z++) {
                try {
                  // and populate the years array with the 4-digit years of all transactions
                  curr_transaction_years.push(
                    isodate(curr_transaction_date[z]).getFullYear()
                  );
                  // Catch typerror thrown by isodate, because I'm bad at JS
                } catch (e) {
                  console.log(e);
                  continue;
                }
              }
            }
            // Need to catch exception in case of JSON.parse throwing typerror
            try {
              // Get the sector name of the current ativity
              var curr_sector_name = JSON.parse(
                this.raw_data.data.response.docs[i].sector
              ).sector.name;
              //console.log(curr_sector_name)
            } catch (e) {
              // Skip to next item if error
              continue;
            }
            // Make sure array fo transaction years isnt undefined
            if (typeof curr_transaction_years !== "undefined") {
              // Then check to see if an transactions were in the target year
              if (
                curr_transaction_years.includes(
                  parseInt(this.target_year_1, 10)
                )
              ) {
                // increment tally of records aggregated
                this.numrecords += 1;
                // Check if the current activity's sector is already in the array of sectors
                if (newcategories.includes(curr_sector_name)) {
                  // If it is, check the index of the sector
                  let a = newcategories.indexOf(curr_sector_name);
                  // Get the sum of all transactions in the target year
                  let transaction_sum = this.sum_transactions(
                    curr_transaction_value,
                    curr_transaction_date,
                    this.target_year_1
                  );
                  // add it to total for sector
                  let res = newseries[a] + transaction_sum;
                  newseries[a] = res;
                  //add it to running total
                  this.running_total += transaction_sum;
                }
                // Else if the sector is new
                else {
                  // Add the sector to the sectors array
                  newcategories.push(curr_sector_name);
                  //console.log(newcategories)
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
                    this.running_total += transaction_sum;
                  }
                }
              }
            }
          }
          // Now update the chart data
          // REMEMBER: You can't do vm.options.xaxis.categories = newcategories for some reason. The WHOLE OBJECT needs to be updated.
          this.series = [
            {
              data: newseries,
            },
          ];
          this.options = {
            ...this.options,
            ...{
              xaxis: {
                categories: newcategories,
              },
            },
          };
        } catch (e) {
          console.log(
            "An error was thrown. Probably because there is no input data"
          );
          //console.log(e)
        }
      },
    },
  },
  methods: {
    sum_transactions: function (values, dates, target) {
      let sum = 0;
      //catch instances where transaction value are undefined
      try {
        for (let i = 0; i < values.length; i++) {
          if (isodate(dates[i]).getFullYear() == parseInt(target, 10)) {
            sum += values[i];
          }
        }
      } catch (e) {
        return 0;
      }
      return sum;
    },
    format_price: function (value) {
      let val = (value / 1).toFixed(2).replace(",", ".");
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
  },
};
</script>

<style lang="css" scoped></style>
