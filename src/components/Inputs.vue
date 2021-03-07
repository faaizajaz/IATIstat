<template>
  <div class="inputs">
    <b>Enter an organization code: </b>
    <input
      id="org-code"
      v-model="organization"
      placeholder="Enter org code"
      type="text"
    />
    <br />
    <b>Enter years separated by commas (e.g. 2017,2018,2019)</b>
    <input id="target_years" v-model="target_years" type="text" />
    <br />
    <b>Group sectors by IATI category? </b>
    <input type="checkbox" value="test" v-model="group_sectors" />
    <br />
    <button v-on:click="send_query">Submit</button>
    <br />
    <br />
    <p>
      <b>Example org codes:</b>
      <br />
      <i>GB-GOV-1</i>: FCDO
      <br />
      <i>XM-DAC-41301</i>: FAO
      <br />
      <br />
    </p>
  </div>
</template>

<script>
const axios = require("axios");

export default {
  name: "Inputs",
  data: function () {
    return {
      organization: "",
      target_years: "",
      group_sectors: false,
    };
  },
  methods: {
    send_query: function () {
      this.$emit("query", {
        organization: this.organization,
        target_years: this.target_years,
        group_sectors: this.group_sectors,
      });
    },
  },
};
</script>
