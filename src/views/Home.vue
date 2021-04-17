<template>
  <div>
    <h1>Welcome to the IATI dashboard.</h1>
    <br />
    <h3>
      Organization data is:
    <h3 v-if="Object.keys(raw_data).length !== 0">
      loaded.
    </h3>
  </h3>

  <h3>
      Country data is:
    <h3 v-if="Object.keys(raw_country_data).length !== 0">
      loaded.
    </h3>
  </h3>
  </div>
</template>

<script>
export default {
  name: "Home",

  props: {
    raw_data: {
      type: Object,
      default: () => null,
    },
    raw_country_data: {
      type: Object,
      default: () => null,
    },

  },

  data() {
    return {};
  },
};
</script>

<style lang="css" scoped></style>
