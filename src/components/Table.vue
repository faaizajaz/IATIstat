<template>
  <div id="table">
    <b>Acitvities:</b>
    <vue-good-table
      v-bind:columns="columns"
      v-bind:rows="rows"
      :pagination-options="{
    enabled: true
  }"
    ></vue-good-table>
    <b>{{ pagination }}</b>
  </div>
</template>

<script>
import "vue-good-table/dist/vue-good-table.css";
import { VueGoodTable } from "vue-good-table";

export default {
  name: "Table",

  components: {
    VueGoodTable,
  },

  props: {
    columns: {
      type: Array,
      default: () => [],
    },
    rows: {
      type: Array,
      default: () => [],
    },
  },

  // Props:
  //        columns: An array describing columns [ { label: "label1", field "label1" }, {...} ]
  //        rows: Array containing list with field values [ {id:1, field1: "whatever"}, {...} ]
  // Apex dataPointSelection event triggers function that creates columns and rows and passes into table component.

  data() {
    return {

    };
  },
};
</script>

<style lang="css" scoped></style>
