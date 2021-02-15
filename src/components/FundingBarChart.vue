<template>
  <canvas ref="sectorChart" width="900px" height="250px"></canvas>
</template>

<script>
import { Chart } from 'chart.js'
export default {
  props: {
    label: {
      type: Array
    },
    chartData: {
      type: Array
    }
  },
  mounted() {
    new Chart(this.$refs.sectorChart,{
      type: 'bar',
      data: {
        labels: this.label,
        datasets: [
        {
          label: 'SECTORS',
          backgroundColor: 'rgba(54,140,244,0.9',
          data: this.chartData,
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
            }
          }]
        }
      }
    });
  },

  name: 'FundingBarChart',
}

</script>

<style lang="css" scoped>
</style>
