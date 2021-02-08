import readlineSync from "readline-sync";
import csv from "csvtojson";
import { bestSMA5, longestTrends, volumesAndPriceChanges } from "./finders.js";
import {
  entriesByDate,
  formatDataArray,
  validateDates,
  isValidDate,
} from "./helpers.js";

let data;
let mode;
let path;
let fileFirstEntry;
let fileLastEntry;
let firstTime = true;
let sameDates = false;
let startOver = true;
let stillAnalyzing = true;
let dates = {
  custom: null,
  base: {
    first: {},
    last: {},
    firstIndex: -1,
    lastIndex: -1,
  },
};

path = "test_data/Test3.csv";

while (stillAnalyzing) {
  let errorStatus = false;
  if (firstTime) {
    console.log("Welcome to your personal stock analysist Mr. McDuck!");
  }
  let fileReadSuccess = false;
  while (!fileReadSuccess) {
    try {
      if (startOver) {
        // path = readlineSync.question(
        //   "Please provide the name of a csv file to import data from: "
        // );
        data = await csv().fromFile(path);
        data = formatDataArray(data);
        fileFirstEntry = new Date(data[0].Date);
        fileLastEntry = new Date(data[data.length - 1].Date);
        console.log(`File read succesfully.`);
      }
      if (!sameDates) {
        console.log(
          `Date range of stock entries in file "${path}" is ${fileFirstEntry.toDateString()} - ${fileLastEntry.toDateString()}`
        );
      }
      fileReadSuccess = true;
    } catch (err) {
      console.log(`${err.name} ${err.message}`);
      fileReadSuccess = false;
    }
  }
  try {
    let modes = [
        "Find bullish (upward) trends",
        "Find highest trading volumes and most significant price changes within a day",
        "Find which dates had the best opening price compared to 5 days simple moving average",
      ],
      index = readlineSync.keyInSelect(
        modes,
        "In which mode do you want to analyze this data?"
      );
    // console.log(`Ok, mode ${index + 1} selected`);
    // According to user's selection, mode is set to 1, 0 or 5. This number means how many
    // entries we need to pick from the data before the starting day, so it works properly
    // on each main function.
    if (index === 0) {
      mode = 1;
    } else if (index === 1) {
      mode = 0;
    } else if (index === 2) {
      mode = 5;
    } else {
      break;
    }
    if (!sameDates) {
      // This if is nested and not as pretty as it could be, but since we are using console UI and readline-sync, it is what it is.
      if (
        readlineSync.keyInYN(
          "Do you want to provide a custom date range within the data?"
        )
      ) {
        dates.custom = true;
        let validStart = false;
        let validEnd = false;
        let startInput = "";
        let endInput = "";
        while (!validStart) {
          try {
            startInput = readlineSync.question(
              `Provide a starting date (month/day/year): `
            );
            validStart = isValidDate(startInput, data, mode, index, true);
          } catch (err) {
            console.log(`${err.name} ${err.message}`);
          }
        }
        dates.base.first = new Date(startInput);
        console.log(
          `Custom range starting day set as ${dates.base.first.toDateString()}.`
        );
        while (!validEnd) {
          try {
            endInput = readlineSync.question(
              `Provide an ending date (month/day/year): `
            );
            validEnd = isValidDate(
              endInput,
              data,
              mode,
              index,
              false,
              dates.base.first
            );
          } catch (err) {
            console.log(`${err.name} ${err.message}`);
          }
        }
        dates.base.last = new Date(endInput);
        console.log(
          `Custom range set as ${dates.base.first.toDateString()} - ${dates.base.last.toDateString()}.`
        );
      } else {
        dates.custom = false;
        dates.base.first = fileFirstEntry;
        dates.base.last = fileLastEntry;
        dates.base.firstIndex = 0;
        dates.base.lastIndex = data.length - 1;
      }
    }
    dates = validateDates(data, mode, dates, index);
    let selected = entriesByDate(data, mode, dates);
    console.log("selected prints this");
    console.log(selected);
    // analyzeStockData(selected, mode, dates);
    if (mode == 1) {
      longestTrends(selected);
    } else if (mode == 0) {
      volumesAndPriceChanges(selected);
    } else if (mode == 5) {
      bestSMA5(selected);
    }

    console.log("Task completed.");
  } catch (err) {
    errorStatus = true;
    // console.log(err.name);
    console.log(err.message);
  } finally {
    if (
      readlineSync.keyInYN(
        `Do you want to continue analyzing this file "${path}"?`
      )
    ) {
      // 'Y' key was pressed.
      startOver = false;
      firstTime = false;
      if (
        !errorStatus &&
        dates.custom &&
        readlineSync.keyInYN(
          `Keep the same date range as before? (${dates.base.first.toDateString()} - ${dates.base.last.toDateString()})`
        )
      ) {
        sameDates = true;
      } else {
        sameDates = false;
      }
    } else {
      // Another key was pressed.
      if (readlineSync.keyInYN(`Do you want to continue with another file?`)) {
        // 'Y' key was pressed.
        sameDates = false;
        startOver = true;
        stillAnalyzing = true;
        firstTime = false;
      } else {
        startOver = false;
        stillAnalyzing = false;
        firstTime = false;
      }
    }
  }
}
console.log("Okay, bye bye.");
process.exit();
