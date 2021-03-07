<template>
  <div>
    <i
      >Total funding amount for {{ target_years }}:
      {{ format_price(running_total) }}</i
    >
    <br />
    <i>Aggregated {{ numrecords }} records.</i>
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
  name: "OrgBySectorYearOptions",
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
    group_sectors: {
      type: Boolean,
      default: false,
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
          id: "sectorbarchart",
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
            horizontal: false,
          },
        },
        xaxis: {
          categories: [],
          tickPlacement: "on",
        },
        yaxis: {
          min: 0,
          labels: {
            formatter: function (value) {
              let val = (value / 1).toFixed(0);
              return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            },
          },
        },

        noData: {
          text: "Loading",
        },
      },
      series: [],
      running_total: 0,
      numrecords: 0,
      table_columns: [],
      table_rows: [],
      target_years_array: [],
      newcategories: [],
      table_master: {},
    };
  },
  watch: {
    check_for_update: {
      //deep: true,
      //immediate: true,
      handler: function () {
        this.create_chart();

        //this.refresh_chart=false;
      },
    },
  },
  computed: {
    check_for_update() {
      return this.refresh_chart;
    },
  },
  created: function () {
    console.log("created");
    this.create_chart();
  },

  methods: {
    create_chart: function () {
      this.numrecords = 0;
      this.running_total = 0;
      this.series = [];
      this.table_columns = [];
      this.table_rows = [];
      this.newcategories = [];
      this.table_master = {};
      let newseries = {};

      let activity_list = {};
      //make array of target years
      this.target_years_array = this.target_years.split(",");
      for (let year in this.target_years_array) {
        newseries[this.target_years_array[year]] = [];
        activity_list[this.target_years_array[year]] = [];
        this.table_master[this.target_years_array[year]] = [];
      }

      //console.log(this.raw_data)

      try {
        console.log("start");
        //
        for (let i = 0; i < this.raw_data.data.response.docs.length; i++) {
          var curr_sector_name = "UNDEFINED";
          var curr_sector_cat = "UNDEFINED";
          let curr_transaction_value = this.raw_data.data.response.docs[i]
            .transaction_value;
          let curr_transaction_date = this.raw_data.data.response.docs[i]
            .transaction_value_date;
          // Create a new array with only transaction years
          let curr_transaction_years = this.make_years(curr_transaction_date);
          let curr_sector = "";
          try {
            curr_sector_name = JSON.parse(
              this.raw_data.data.response.docs[i].sector
            ).sector.name;
            curr_sector_cat = this.sector_code_to_cat(
              JSON.parse(this.raw_data.data.response.docs[i].sector).sector.code
            );
            //console.log(curr_sector_name)
          } catch (e) {
            //console.log("Error trying to lookup sector codes at index " + i +":");
            curr_sector_cat = "Undefined sector";
            curr_sector_name = "Undefined sector";
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
            if (this.newcategories.includes(curr_sector)) {
              // If it is, check the index of the sector
              let a = this.newcategories.indexOf(curr_sector);
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

                // ********************** MAKING MASTER COLUMN LIST
                if (q > 0) {
                  let country = "";

                  try {
                    country = this.raw_data.data.response.docs[i]
                      .recipient_country_code[0];
                  } catch (e) {
                    country = "No country";
                  }

                  let master_rows = {
                    id: this.raw_data.data.response.docs[i].iati_identifier,
                    activity_name: this.raw_data.data.response.docs[i]
                      .title_narrative[0],
                    //country: this.raw_data.data.response.docs[i].recipient_country_code[0],
                    [this.target_years_array[year]]: q,
                    value: q,
                    sector: curr_sector,
                    country: country,
                  };
                  this.table_master[this.target_years_array[year]].push(
                    master_rows
                  );
                }
                // *************************************
              }
            }
            // Else if the sector is new
            else {
              // Add the sector to the sectors array
              this.newcategories.push(curr_sector);
              for (let year in this.target_years_array) {
                let q = this.sum_transactions(
                  curr_transaction_value,
                  curr_transaction_date,
                  this.target_years_array[year]
                );
                newseries[this.target_years_array[year]].push(q);

                //console.log(curr_transaction_years);
                //console.log(typeof this.target_years_array[year]);
                //console.log (curr_transaction_years.includes(parseInt(this.target_years_array[year]), 10))

                // if sector is new, add the current activity code to list of acitivities for the sector
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

                // ***************************** MAKING MASTER COLUMNS
                if (q > 0) {
                  let country = "";

                  try {
                    country = this.raw_data.data.response.docs[i]
                      .recipient_country_code[0];
                  } catch (e) {
                    country = "No country";
                  }
                  let master_rows = {
                    id: this.raw_data.data.response.docs[i].iati_identifier,
                    activity_name: this.raw_data.data.response.docs[i]
                      .title_narrative[0],
                    //country: this.raw_data.data.response.docs[i].recipient_country_code[0],
                    [this.target_years_array[year]]: q,
                    value: q,
                    sector: curr_sector,
                    country: country,
                  };
                  this.table_master[this.target_years_array[year]].push(
                    master_rows
                  );
                }

                //*****************************************
              }
            }
          }

          // MAKING TABLE ROW
        }

        // Now update the chart data
        // REMEMBER: You can't do vm.options.xaxis.categories = this.newcategories for some reason. The WHOLE OBJECT needs to be updated.
        /*this.series = [
            {
              data: newseries,
            },
          ];*/

        //console.log(activity_list);
        //console.log(this.table_master);

        let sort_array = [];
        for (let y in this.target_years_array) {
          sort_array.push(newseries[this.target_years_array[y]]);
        }
        //add categories to end of array so that they are sorted
        sort_array.push(this.newcategories);

        // this sorts by first arg

        let ta = this.parallel_sort(sort_array);

        // remove categories from series array
        this.newcategories = ta.pop();

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
              data: ta[year],
            };
            this.series.push(tmp);
          }
        } catch (e) {
          console.log(e);
        }

        // MAKING TABLE COLUMNS
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

        // MAKING TABLE rows
      } catch (e) {
        console.log(
          "An error was thrown. Probably because there is no input data"
        );
        console.log(e);
      }
    },

    // args: index of activity clicked, activity list
    // returns: columns array
    // usage: after sort, table_rows = thisfunction(args)

    make_table_rows: function (seriesIndex, dataPointIndex) {
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
          this.table_master[this.target_years_array[seriesIndex]][row].sector ==
          this.newcategories[dataPointIndex]
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
