<template>
  <div>Someting</div>
</template>

<script>
const isodate = require("isodate");
import { viewHelpers } from "../mixins/viewHelpers.js";
import { dataHelpers } from "../mixins/dataHelpers.js";

export default {

  name: 'OrgSectorCategoryYear',
  mixins: [viewHelpers,dataHelpers],
  props: {
    raw_data: {
      type: Object,
      default:() => null,
    },
    target_year_1: {
      type: String,
      default: "",
    },
    target_year_2: {
      type: String,
      default:"",
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
          name: "Year 1",
          data: [],
        },
        {
          name: "Year 2",
          data: [],
        },
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
      handler: function() {
        this.numrecords = 0;
        this.running_total_1 = 0;
        this.running_total_2 = 0;
        let series_1 = [];
        let series_2 = [];
        let newcategories = [];

        try{
          for(let i = 0; i < this.raw_data.data.response.docs.length; i++) {
            raw_data = this.raw_data.data.response.docs;
            let curr_activity_values = raw_data[i].transaction_value;
            let curr_transaction_dates = raw_data[i].transaction_date;

            //Extract years into array
            let curr_transaction_years = [];
            if (typeof curr_transaction_date !== "undefined") {
              for (let z = 0; z < curr_transaction_dates.length; z++) {
                try{
                  curr_transaction_years.push(isodate(curr_transaction_dates[z]).getFullYear());
                } catch (e) {
                  console.log(e);
                  continue;
                }
              }
            }

            try {
              var curr_sector_code = JSON.parse(raw_data[i].sector).sector.code.substring(0,3);
              // Now convert this to a name using the sector category codelist

            } catch (e) {
              console.log(e);
              continue;
            }

            // Now I need to look up from the codelist to assign the current sector category
            // Should make a utility function for this

          }

        } catch (e) {
          console.log(e)
        }
      }
    }
  }
}
</script>

<style lang="css" scoped>
</style>
