<template>
  <div>
    <b>Filter donor organizations</b>
    <v-select multiple :options="org_array" v-model="filter_org"></v-select>
    <button v-on:click="create_chart">Refresh chart</button>
    <apexchart type="bar" :options="options" :series="series"></apexchart>

  </div>
</template>

<script>
const isodate = require("isodate");
import { viewHelpers } from "../mixins/viewHelpers.js";
import { dataHelpers } from "../mixins/dataHelpers.js";
import 'vue-select/dist/vue-select.css';
import vSelect  from 'vue-select'
export default {

  name: 'CountryByOrgSpending',
  mixins: [viewHelpers, dataHelpers],
  components: {
    vSelect
  },
  props: {
    raw_country_data: {
      type: Object,
      default: () => null,
    },
    target_years: {
      type: String,
      default: "",
    },
    refresh_chart:{
      type: Boolean,
      default: false,
    }
  },

  data () {
    return {
      options: {
        chart: {
          width: "95%",
          id: "countryorgbarchart",
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
      newcategories: [],
      target_years_array: [],
      org_array: [],
      filter_org: []

    }
  },
  watch: {
    check_for_update: {
      handler: function () {
        this.create_chart();
      }
    }
  },

  computed: {
    check_for_update() {
      return this.refresh_chart;
    }
  },

  created: function () {
    this.create_chart();
  },

  methods: {
    create_chart: function () {
      this.series = []
      this.newcategories=[];
      this.numrecords = 0;
      this.org_array=[];

      let newseries = {};
      let activity_list = {};


      this.target_years_array = this.target_years.split(",");
      for (let year in this.target_years_array) {
        newseries[this.target_years_array[year]] = [];
        activity_list[this.target_years_array[year]] = [];
      }

      if (this.raw_country_data.data !== undefined) {
        for (let i = 0; i < this.raw_country_data.data.response.docs.length; i++) {
          var curr_org_code = "Undefined org";

          let curr_transaction_value = this.raw_country_data.data.response.docs[i].transaction_value;
          let curr_transaction_date=this.raw_country_data.data.response.docs[i].transaction_value_date;
          let curr_transaction_years = this.make_years(curr_transaction_date);

          let curr_transaction_type = this.raw_country_data.data.response.docs[i].transaction_type;

          try {
            if (this.raw_country_data.data.response.docs[i].reporting_org_ref !== undefined) {
              curr_org_code=this.raw_country_data.data.response.docs[i].reporting_org_ref;
            } else {
              curr_org_code="Undefined org"
            }
          } catch (e) {
            curr_org_code="Undefined org";
          }


          if (typeof curr_transaction_years!=="undefined") {
            this.numrecords+=1;

            if (this.org_array.includes(curr_org_code) === false) {
              this.org_array.push(curr_org_code);
            }


            if (this.newcategories.includes(curr_org_code)) {
              let a = this.newcategories.indexOf(curr_org_code);
              for (let year in this.target_years_array) {
                let q = this.sum_transactions(curr_transaction_value, curr_transaction_date, curr_transaction_type,this.target_years_array[year]);

                let res = newseries[this.target_years_array[year]][a] + q;
                newseries[this.target_years_array[year]][a] = res;

                if (curr_transaction_years.includes(parseInt(this.target_years_array[year]), 10)) {
                  try {
                    activity_list[this.target_years_array[year]][a].push(this.raw_country_data.data.response.docs[i].iati_identifier)
                  } catch (e) {
                    console.log(e);
                  }
                }

                //Do table stuff here if you want to.

              }
            } else {
              if (this.filter_org.length > 0) {
                if (this.filter_org.includes(curr_org_code)) {
                  this.newcategories.push(curr_org_code);

                  for (let year in this.target_years_array) {
                    let q = this.sum_transactions(curr_transaction_value, curr_transaction_date,curr_transaction_type,this.target_years_array[year]);

                    newseries[this.target_years_array[year]].push(q);

                    if (curr_transaction_years.includes(parseInt(this.target_years_array[year]), 10)) {
                      try {
                        activity_list[this.target_years_array[year]].push([this.raw_country_data.data.response.docs[i].iati_identifier]);
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

                    // DO table stuff here if wanted


                  }
                }
              } else {
                this.newcategories.push(curr_org_code);

                for (let year in this.target_years_array) {
                  let q = this.sum_transactions(curr_transaction_value,curr_transaction_date,curr_transaction_type,this.target_years_array[year]);
                  newseries[this.target_years_array[year]].push(q);

                  if (curr_transaction_years.includes(parseInt(this.target_years_array[year]), 10)) {
                    try {
                      activity_list[this.target_years_array[year]].push([this.raw_country_data.data.response.docs[i].iati_identifier]);
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
                // DO TABLE STUFF HERE IF YOU WANT
                }
              }
            }

          }

        }

        let sort_array = [];
        for (let y in this.target_years_array) {
          sort_array.push(newseries[this.target_years_array[y]]);
        }

        sort_array.push(this.newcategories);

        let ta = this.parallel_sort(sort_array);

        let keeper = [[]];



        for (let i in ta[0]) {
          let keep = false;
          //if ta[x][i] is less than 0 for all x, remove all elements ta[x][i]
          // if its greater than 0 for any number, keep
          for (let x in ta) {
            //Here we can provide a minimum threshold for data display
            if (typeof ta[x][i] === 'number' && ta[x][i] > 10000000) {
              keep = true;

            }

          }

          if (keep == true) {
            //everything in ta[x] at i
            for (let x in ta) {
              if (keeper[x]) {
                keeper[x].push(ta[x][i])
              } else {
                keeper.push([ta[x][i]]);
              }
            }
          }

          //console.log(ta[0][i]);
        }




        this.newcategories=keeper.pop();



        this.options = {
          ...this.options,
          ... {
            xaxis: {
              categories: this.newcategories,
            },
          },
        };

        try {
          for (let year in this.target_years_array) {
            let tmp = {
              name: this.target_years_array[year],
              data: keeper[year],
            };
            this.series.push(tmp);
          }
        } catch (e) {
          console.log(e);
        }

        //TABLE STUFF HERE IF WANTED

      } else {
        console.log("There is no country input data")
      }

    },

    //AD MAKE TALBE METHOD IF WANTED
  }
}
</script>

<style lang="css" scoped>
</style>
