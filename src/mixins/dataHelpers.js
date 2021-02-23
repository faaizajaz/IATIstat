const isodate = require("isodate");

export const dataHelpers = {
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
  },
};
