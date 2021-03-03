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
export default {

  name: 'OrgByCountrySpending',

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

}
</script>

<style lang="css" scoped>
</style>
