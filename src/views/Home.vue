<template>
  <div>
    <h1>Welcome to the IATI dashboard.</h1>
    <h3>
      PLEASE NOTE: The IATI API is temporarily offline for maintenance as of July 1 2021. It is not clear when it will be back online. For more information, see <a href="https://iatistandard.org/en/news/technical-notice-2-iatis-datastore-to-be-integrated-in-new-unified-single-platform/" class="skiplink">the official announcement</a>.
    </h3>
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
