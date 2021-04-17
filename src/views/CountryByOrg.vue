<template>
  <div>
    <CountryByOrgSpending
      v-bind:raw_country_data="raw_country_data"
      v-bind:refresh_chart="refresh_chart"
      v-bind:target_years="target_years"

    ></CountryByOrgSpending>
  </div>
</template>

<script>
import CountryByOrgSpending from "../components/CountryByOrgSpending";

export default {
  name: "SpendingByCountryOrg",

  components: {
    CountryByOrgSpending,
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
    refresh_chart: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {};
  },
};
</script>

<style lang="css" scoped></style>
