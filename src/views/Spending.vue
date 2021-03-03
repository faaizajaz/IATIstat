<template>
  <div>
  <OrgBySectorYearOptions
    v-bind:raw_data="raw_data"
    v-bind:refresh_chart="refresh_chart"
    v-bind:target_years="target_years"
    v-bind:group_sectors="group_sectors"
  ></OrgBySectorYearOptions>
  </div>
</template>

<script>
import OrgBySectorYearOptions from "../components/OrgBySectorYearOptions"

export default {

  name: 'Spending',

  components: {
    OrgBySectorYearOptions
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



  data () {
    return {

    }
  }
}
</script>

<style lang="css" scoped>
</style>
