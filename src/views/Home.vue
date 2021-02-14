<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
//import Chart from 'chart.js'
const axios = require("axios")

export default {
  name: 'Home',
  data : ()=> {
    return {
      labels : [],
      donors: [],
    }

  },
  components: {
    HelloWorld
  },
  async created() {
    var row_index = 0;
    const {data} = await axios.get("https://iatidatastore.iatistandard.org/search/activity/?q=reporting_org_ref:GB-GOV-1&fl=sector,title_narrative&rows=100&start=" + row_index);
    console.log(data)
  }
}
</script>
