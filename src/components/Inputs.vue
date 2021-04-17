<template>
  <div class="inputs">
    <b>Enter an organization code: </b>
    <input
      id="org-code"
      v-model="organization"
      placeholder="Enter org code"
      type="text"
    />
    <br><br>
    <b>OR</b>
    <br>
    <br>
    <b>Enter a country code: </b>
    <input
      id="country-code"
      v-model="country"
      placeholder="Enter country code"
      type="text"
    />


    <br>
    <br>
    <hr>
    <br>
    <b>Enter years separated by commas (e.g. 2017,2018,2019)</b>
    <input id="target_years" v-model="target_years" type="text" />
    <br />
    <b>Group sectors by IATI category? </b>
    <input type="checkbox" value="test" v-model="group_sectors" />
    <br />
    <button v-on:click="send_query">Submit</button>
    <br />
    <br />

    <hr>
  </div>
</template>

<script>
const axios = require("axios");

export default {
  name: "Inputs",
  data: function () {
    return {
      organization: "",
      country: "",
      target_years: "",
      group_sectors: false,
    };
  },
  methods: {
    send_query: function () {
      this.$emit("query", {
        organization: this.organization,
        country: this.country,
        target_years: this.target_years,
        group_sectors: this.group_sectors,
      });
    },
  },
};
</script>
