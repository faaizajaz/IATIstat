const isodate = require("isodate");

export const chartHelpers = {
  methods: {
    sum_transactions: function (values, dates, target) {
      let sum = 0;
      try {
        for (let i = 0; i < values.length; i++) {
          if (isodate(dates[i]).getFullYear() == parseInt(target, 10)) {
            sum += values[i];
            //console.log("trying to sum")
          }
        }
      } catch (e) {
        //console.log("Couldn;t sum")
        return 0;
      }
      return sum;
    },
    format_price: function (value) {
      let val = (value / 1).toFixed(2).replace(",", ".");
      return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
  },
};
