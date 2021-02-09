import csv from "csvtojson";
import readlineSync from "readline-sync";
import { bestSMA5, longestTrends, volumesAndPriceChanges } from "./finders.js";
import {
  entriesByDate,
  formatDataArray,
  isValidDate,
  validateDates,
} from "./helpers.js";

let data;
let mode;
let path;
let fileFirstEntry;
let fileLastEntry;
let sameDates = false;
let newFilePath = true;
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

// APP STARTING POINT
console.log("Welcome to your personal stock analysist Mr. McDuck!");
while (stillAnalyzing) {
  let errorStatus = false;
  let fileReadSuccess = false;
  while (!fileReadSuccess) {
    try {
      if (newFilePath) {
        path = readlineSync.question(
          "Please provide the name of a csv file to import data from: "
        );
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
      fileReadSuccess = false;
      console.log(`${err.name} ${err.message}`);
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
      stillAnalyzing = false;
      break;
    }
    let validationSuccess = false;
    while (!validationSuccess) {
      if (!sameDates) {
        // This if is nested and not as pretty as it could be, but since we are using console
        // UI and readline-sync, it is what it is.
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
            `Custom range set to ${dates.base.first.toDateString()} - ${dates.base.last.toDateString()}.`
          );
        } else {
          dates.custom = false;
          dates.base.first = fileFirstEntry;
          dates.base.last = fileLastEntry;
          dates.base.firstIndex = 0;
          dates.base.lastIndex = data.length - 1;
        }
      }
      try {
        dates = validateDates(data, mode, dates, index);
        validationSuccess = true;
      } catch (err) {
        validationSucces = false;
        errorStatus = true;
        console.log(`${err.name} ${err.message}`);
      }
    }
    let selected = entriesByDate(data, mode, dates);
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
    console.log(`${err.name} ${err.message}`);
  } finally {
    if (
      stillAnalyzing &&
      readlineSync.keyInYN(
        `Do you want to continue analyzing this file "${path}"?`
      )
    ) {
      newFilePath = false;
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
      if (
        stillAnalyzing &&
        readlineSync.keyInYN(`Do you want to continue with another file?`)
      ) {
        sameDates = false;
        newFilePath = true;
        stillAnalyzing = true;
      } else {
        newFilePath = false;
        stillAnalyzing = false;
      }
    }
  }
}
console.log("Okay, bye bye.");
process.exit();
