<template>
  <div>
    <h1>Welcome to the IATI dashboard.</h1>
    <br>
    <h3 v-if="Object.keys(raw_data).length !== 0">Data is loaded, you can now use the links in the sidebar to explore.</h3>
  </div>
</template>

<script>
export default {

  name: 'Home',

  props: {
    raw_data: {
      type: Object,
      default: () => null,
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
