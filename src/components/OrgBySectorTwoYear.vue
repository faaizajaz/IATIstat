<template>
  <div>
    <b>Comparing {{target_year_1}} with {{target_year_2}}.</b>
    <br>
    <i>Aggregated {{ numrecords }} records.</i>
    <br>
    <i>Total funding amount for {{ target_year_1 }}: {{ format_price(running_total_1) }}</i>
    <br>
    <i>Total funding amount for {{ target_year_2 }}: {{ format_price(running_total_2) }}</i>
    <apexchart height="600" type="bar" :options="options" :series="series"></apexchart>
  </div>
</template>

<script>
const isodate = require("isodate");
export default {

  name: 'OrgBySectorTwoYear',
  props: {
    raw_data: {
      type: Object,
      default: () => null,
    },
    target_year_1: {
      type: String,
      default: "",
    },
    target_year_2: {
      type: String,
      default: "",
    }
  },
  data () {
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
          name: 'Year 1',
          data: [],
        },
        {
          name: 'Year 2',
          data: [],
        }
      ],
      running_total_1: 0,
      running_total_2: 0,
      numrecords: 0,
    }
  },
  watch: {
    raw_data: {
      deep: true,
      immediate: true,
      handler: function () {
        this.numrecords = 0;
        this.running_total_1 = 0;
        this.running_total_2 = 0;
        let series_1 = [];
        let series_2 = [];
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
              //console.log(curr_transaction_years)
              if (
                curr_transaction_years.includes(parseInt(this.target_year_1, 10)) || curr_transaction_years.includes(parseInt(this.target_year_2, 10))
              ) {
                // increment tally of records aggregated
                this.numrecords += 1;
                //console.log(this.sum_transactions(curr_transaction_value,curr_transaction_date,target_year_1))
                // Check if the current activity's sector is already in the array of sectors
                if (newcategories.includes(curr_sector_name)) {
                  // If it is, check the index of the sector
                  let a = newcategories.indexOf(curr_sector_name);
                  // Get the sum of all transactions in the target year
                  let transaction_sum_1 = this.sum_transactions(
                    curr_transaction_value,
                    curr_transaction_date, this.target_year_1
                  );
                  //console.log(transaction_sum_1)
                  //console.log(transaction_sum_2)
                  let transaction_sum_2 = this.sum_transactions(
                    curr_transaction_value,
                    curr_transaction_date,
                    this.target_year_2)
                  // add it to total for sector
                  let res_1 = series_1[a] + transaction_sum_1;
                  series_1[a] = res_1;
                  //add it to running total
                  this.running_total_1 += transaction_sum_1;

                  let res_2 = series_2[a] + transaction_sum_2;
                  series_2[a] = res_2;
                  this.running_total_2 += transaction_sum_2;
                }
                // Else if the sector is new
                else {
                  // Add the sector to the sectors array
                  newcategories.push(curr_sector_name);
                  //console.log(newcategories)
                  // If there is no transaction value for the current record
                  if (typeof curr_transaction_value == "undefined") {
                    // make the initial value 0
                    series_1.push(0);
                    series_2.push(0);
                  } else {
                    // Otherwise add the transaction value to the total
                    let transaction_sum_1 = this.sum_transactions(
                      curr_transaction_value,
                      curr_transaction_date,
                      this.target_year_1
                    );
                    let transaction_sum_2 = this.sum_transactions(
                      curr_transaction_value,
                      curr_transaction_date,
                      this.target_year_2
                    );
                    series_1.push(transaction_sum_1);
                    series_2.push(transaction_sum_2);
                    // And add to the running total
                    this.running_total_1 += transaction_sum_1;
                    this.running_total_2 += transaction_sum_2;
                  }
                }
              }
            }
          }
          // Now update the chart data
          // REMEMBER: You can't do vm.options.xaxis.categories = newcategories for some reason. The WHOLE OBJECT needs to be updated.
          //console.log(series_1)
          //console.log(series_2)
          this.series = [
            {
              name: this.target_year_1,
              data: series_1,
            },
            {
              name: this.target_year_2,
              data: series_2,
            }
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
      //console.log("entered sum fxn 2")
      //console.log(target)

      //catch instances where transaction value are undefined
      try {
        for (let i = 0; i < values.length; i++) {
          if (isodate(dates[i]).getFullYear() == parseInt(target, 10)) {
            sum += values[i];
            //console.log("trying to sum")
          }
        }
      } catch (e) {
        //console.log("Couldn;t sum")
        return 0;

      }
      return sum;
    },
    format_price: function (value) {
      let val = (value/1).toFixed(2).replace(',', '.')
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
  },
}
</script>

<style lang="css" scoped></style>
