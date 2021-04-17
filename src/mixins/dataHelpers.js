const isodate = require("isodate");
const axios = require("axios");
import sector_codelist from "../../iatidata/sector-codelist.json";

export const dataHelpers = {
  methods: {
    sum_transactions: function (values, dates, types, target) {
      let sum = 0;
      try {
        for (let i = 0; i < values.length; i++) {
          if (isodate(dates[i]).getFullYear() == parseInt(target, 10) && (types[i] == 3) || types[i] == 4) {
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
    /*    // Options:
    //    - group sectors into categories
    make_series: function (raw_data, target_years, transaction_type, options) {
      // Get the codelist for sector categories
      let sector_category_codelist_raw;
      try{
        axios.get('http://codelists103.archive.iatistandard.org/data/codelist/SectorCategory.json').then(function (data) {
            sector_category_codelist_raw = data;
        });
      } catch (e) {
        console.log("Could not download sector codelist");
        console.log(e);
      }

      // Processing the raw data
      let trimmed_data = raw_data.data.response.docs ?? {0};

      for (let i = 0; i < trimmed_data.length; i++) {
        let transaction_values = trimmed_data[i].transaction_value;
        let transaction_years = make_years(trimmed_data[i].transaction_date);

        try {
          var curr_sector_code = JSON.parse(trimmed_data[i].sector).sector.code.substring(0, 3);
        } catch (e) {
          continue;
        }

        if (typeof transaction_years !== 'undefined') {

        }
      }
    },*/

    make_years: function (dates) {
      let years = [];
      if (typeof dates !== "undefined") {
        for (let i = 0; i < dates.length; i++) {
          try {
            years.push(isodate(dates[i]).getFullYear());
          } catch (e) {
            console.log("Couldn't parse dates for activity.");
            console.log(e);
            continue;
          }
        }
      }
      return years;
    },

    sector_code_to_cat: function (sector_code) {
      let sector_cat_code = sector_code.substring(0, 3);
      for (let i in sector_codelist) {
        if (sector_codelist.hasOwnProperty(i)) {
          if (sector_cat_code == sector_codelist[i].code) {
            return sector_codelist[i].name;
          }
        }
      }
      return "Sector code not in codelist";
    },

    parallel_sort: function (
      arrays,
      comparator = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
    ) {
      let arrayKeys = Object.keys(arrays);
      let sortableArray = Object.values(arrays)[0];
      let indexes = Object.keys(sortableArray);
      let sortedIndexes = indexes.sort((a, b) =>
        comparator(sortableArray[a], sortableArray[b])
      );

      let sortByIndexes = (array, sortedIndexes) =>
        sortedIndexes.map((sortedIndex) => array[sortedIndex]);

      if (Array.isArray(arrays)) {
        return arrayKeys.map((arrayIndex) =>
          sortByIndexes(arrays[arrayIndex], sortedIndexes)
        );
      } else {
        let sortedArrays = {};
        arrayKeys.forEach((arrayKey) => {
          sortedArrays[arrayKey] = sortByIndexes(
            arrays[arrayKey],
            sortedIndexes
          );
        });
        return sortedArrays;
      }
    },
  },
};
