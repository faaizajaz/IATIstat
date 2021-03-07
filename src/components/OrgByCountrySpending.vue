<template>
  <div>
    <apexchart type="bar" :options="options" :series="series"></apexchart>
    <Table :columns="table_columns" :rows="table_rows"></Table>
  </div>
</template>

<script>
const isodate = require("isodate");
import { viewHelpers } from "../mixins/viewHelpers.js";
import { dataHelpers } from "../mixins/dataHelpers.js";
import Table from "@/components/Table";

export default {
  name: "OrgByCountrySpending",
  mixins: [viewHelpers, dataHelpers],
  components: {
    Table,
  },

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
          events: {
            dataPointSelection: (event, chartContext, config) => {
              //console.log(chartContext);
              this.make_table_rows(config.seriesIndex, config.dataPointIndex);
            },
          },
          width: "100%",
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
            horizontal: true,
          },
        },
        xaxis: {
          categories: [],
          tickPlacement: "on",
          labels: {
            formatter: function (value) {
              let val = (value / 1).toFixed(0).replace(",", ".");
              return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },
          },
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
      filter_country: ["PK", "AF"],
      newcategories: [],
      table_master: {},
      target_years_array: [],
      table_columns: [],
      table_rows: [],
    };
  },

  watch: {
    check_for_update: {
      handler: function () {
        this.create_chart();
      },
    },
  },

  computed: {
    check_for_update() {
      return this.refresh_chart;
    },
  },

  created: function () {
    this.create_chart();
  },

  methods: {
    create_chart: function () {
      this.numrecords = 0;
      this.running_total = 0;
      this.series = [];
      let newseries = {};
      this.newcategories = [];
      this.table_columns = [];
      this.table_rows = [];
      this.table_master = {};

      let activity_list = {};
      //make array of target years
      this.target_years_array = this.target_years.split(",");
      for (let year in this.target_years_array) {
        newseries[this.target_years_array[year]] = [];
        activity_list[this.target_years_array[year]] = [];
        this.table_master[this.target_years_array[year]] = [];
        //console.log(this.target_years_array)
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
            curr_country_code = this.raw_data.data.response.docs[i]
              .recipient_country_code[0];

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
            if (this.newcategories.includes(curr_country_code)) {
              // If it is, check the index of the sector
              let a = this.newcategories.indexOf(curr_country_code);
              for (let year in this.target_years_array) {
                let q = this.sum_transactions(
                  curr_transaction_value,
                  curr_transaction_date,
                  this.target_years_array[year]
                );
                let res = newseries[this.target_years_array[year]][a] + q;
                newseries[this.target_years_array[year]][a] = res;

                if (
                  curr_transaction_years.includes(
                    parseInt(this.target_years_array[year]),
                    10
                  )
                ) {
                  try {
                    activity_list[this.target_years_array[year]][a].push(
                      this.raw_data.data.response.docs[i].iati_identifier
                    );
                  } catch (e) {
                    console.log(e);
                  }
                }

                if (q > 0) {
                  let master_rows = {
                    id: this.raw_data.data.response.docs[i].iati_identifier,
                    activity_name: this.raw_data.data.response.docs[i]
                      .title_narrative[0],
                    //country: this.raw_data.data.response.docs[i].recipient_country_code[0],
                    [this.target_years_array[year]]: q,
                    value: q,
                    country: curr_country_code,
                  };
                  this.table_master[this.target_years_array[year]].push(
                    master_rows
                  );
                }
              }
            }
            // Else if the sector is new
            else {
              if (this.filter_country.includes(curr_country_code)) {
                // Add the sector to the sectors array
                this.newcategories.push(curr_country_code);
                for (let year in this.target_years_array) {
                  let q = this.sum_transactions(
                    curr_transaction_value,
                    curr_transaction_date,
                    this.target_years_array[year]
                  );
                  newseries[this.target_years_array[year]].push(q);

                  if (
                    curr_transaction_years.includes(
                      parseInt(this.target_years_array[year]),
                      10
                    )
                  ) {
                    try {
                      activity_list[this.target_years_array[year]].push([
                        this.raw_data.data.response.docs[i].iati_identifier,
                      ]);
                    } catch (e) {
                      console.log(e);
                    }
                  } else {
                    try {
                      activity_list[this.target_years_array[year]].push([]);
                    } catch (e) {
                      console.log(e);
                    }
                  }

                  if (q > 0) {
                    let master_rows = {
                      id: this.raw_data.data.response.docs[i].iati_identifier,
                      activity_name: this.raw_data.data.response.docs[i]
                        .title_narrative[0],
                      //country: this.raw_data.data.response.docs[i].recipient_country_code[0],
                      [this.target_years_array[year]]: q,
                      value: q,
                      country: curr_country_code,
                    };
                    this.table_master[this.target_years_array[year]].push(
                      master_rows
                    );
                  }
                }
              }
            }
          }
        }

        // Now update the chart data
        // REMEMBER: You can't do vm.options.xaxis.categories = this.newcategories for some reason. The WHOLE OBJECT needs to be updated.
        /*this.series = [
            {
              data: newseries,
            },
          ];*/
        this.options = {
          ...this.options,
          ...{
            xaxis: {
              categories: this.newcategories,
            },
          },
        };

        try {
          for (let year in this.target_years_array) {
            let tmp = {
              name: this.target_years_array[year],
              data: newseries[this.target_years_array[year]],
            };
            this.series.push(tmp);
          }
        } catch (e) {
          console.log(e);
        }

        this.table_columns.push(
          {
            label: "Activity name",
            field: "activity_name",
          },
          {
            label: "Recipient country",
            field: "country",
          }
        );
        for (let year in this.target_years_array) {
          let tmp = {
            label: this.target_years_array[year],
            field: this.target_years_array[year],
            type: "number",
          };
          this.table_columns.push(tmp);
        }
      } catch (e) {
        console.log(
          "An error was thrown. Probably because there is no input data"
        );
        console.log(e);
      }
    },

    make_table_rows: function (seriesIndex, dataPointIndex) {
      console.log("making table");
      console.log(this.table_master);
      //console.log(seriesIndex);
      //console.log(dataPointIndex);
      this.table_rows = [];
      //console.log(this.target_years_array[seriesIndex]);
      //console.log(this.newcategories[dataPointIndex]);
      //console.log(categoriesArray);
      //console.log(this.newcategories);

      //console.log(this.table_master[this.target_years_array[seriesIndex]]);

      for (let row in this.table_master[this.target_years_array[seriesIndex]]) {
        if (
          this.table_master[this.target_years_array[seriesIndex]][row]
            .country == this.newcategories[dataPointIndex]
        ) {
          this.table_rows.push(
            this.table_master[this.target_years_array[seriesIndex]][row]
          );
        }
      }

      //this.table_rows.push(this.table_master[this.target_years_array[seriesIndex]])

      return;
    },
  },
};
</script>

<style lang="css" scoped></style>
