// This is an MVP stock analysist tool for Scrooge McDuck.
// It was a pre-assignment for a job application to Vincit.
// The csv data should be downloaded from Nasdaq webpage,
// for example Apple stock data can be downloaded from:
// https://www.nasdaq.com/market-activity/stocks/aapl/historical
//
// TestData.csv file is included in the repository for testing purposes.
//
// Author: Elias Puukari
// GitHub: eliasisamess
// E-mail: elias.puukari@gmail.com
// Date: Feb 9, 2021
//
// NOTES:
// - Using ESLint / Prettier, that is why semicolons are added, even though they're not compulsory
// - Since this is an MVP (minimum viable product), it only has a console UI
// - Can be easily converted to output data to files or use with external UI

// NODE MODULE IMPORTS
import csv from "csvtojson";
import readlineSync from "readline-sync";

// IMPORTS WITHIN APPLICATION
import { bestSMA5, longestTrends, volumesAndPriceChanges } from "./finders.js";
import {
  entriesByDate,
  formatDataArray,
  isValidDate,
  validateDates,
} from "./helpers.js";

// VARIABLES USED IN THE APPLICATION
let data; // Object array - Will include data from the imported csv file
let mode; // Integer - Will include information for the chosen analysis mode
let path; // String - Will include the file path for the csv file to import
let fileFirstEntry; // Date object - Will include the oldest entry from the formatted data
let fileLastEntry; // Date object - Will include the newest entry from the formatted data
let sameDates = false; // Boolean - Same date range will be used in next round
let newFilePath = true; // Boolean - New file path is to be given
let stillAnalyzing = true; // Boolean - Loops the application
// Dates -object will include chosen date range information
let dates = {
  custom: null, // Boolean - Custom dates selected (true/false)
  base: {
    first: {}, // Date object - Chosen starting day for date range
    last: {}, // Date object - Chosen ending day for date range
    firstIndex: -1, // Integer - Index where starting day is found from
    lastIndex: -1, // Integer - Index where ending day is found from
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
        // This app is using readline-sync for a simple console UI.
        path = readlineSync.question(
          "Please provide the name of a csv file to import data from: "
        );
        // Read and format the csv file for proper object array for later use.
        data = await csv().fromFile(path);
        data = formatDataArray(data);
        // Set meta information of first and last entries found from the csv file.
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
        // This nesting is not as pretty as it could be, but since we are using the readline-sync
        // as the console UI, it is what it is.
        if (
          readlineSync.keyInYN(
            "Do you want to provide a custom date range within the data?"
          )
        ) {
          // If user gives custom date range, set variables for validation.
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
          // If given starting day passes validation, we add it to dates -object.
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
          // If given ending day passes validation, we add it to dates -object.
          dates.base.last = new Date(endInput);
          console.log(
            `Custom range set to ${dates.base.first.toDateString()} - ${dates.base.last.toDateString()}.`
          );
        } else {
          // If no custom date range is used, we set starting and ending dates
          // according to first and last entries found from the csv data.
          dates.custom = false;
          dates.base.first = fileFirstEntry;
          dates.base.last = fileLastEntry;
          dates.base.firstIndex = 0;
          dates.base.lastIndex = data.length - 1;
        }
      }
      try {
        // Before sending data to analysis functions, we need to make sure it
        // matches the chosen mode, so we validate and modify it.
        dates = validateDates(data, mode, dates);
        validationSuccess = true;
      } catch (err) {
        validationSuccess = false;
        // If we catch an error, this status needs to true, to ensure proper
        // control flow within the application.
        errorStatus = true;
        console.log(`${err.name} ${err.message}`);
      }
    }
    // When everything has passed validations, we pick the correct entries from
    // the data according to the chosen mode and execute the analysis function.
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
    // Again, these nested if -statements are not very pretty but they ensure
    // the control flow and prevent user errors.
    if (
      stillAnalyzing &&
      readlineSync.keyInYN(
        `Do you want to continue analyzing this file "${path}"?`
      )
    ) {
      newFilePath = false;
      if (
        // If we continue with the same file, no errors were thrown and
        // custom dates were selected, we ask if the user wants to keep
        // analyzing the file with the same date range as before.
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
        // The application will close after this.
        newFilePath = false;
        stillAnalyzing = false;
      }
    }
  }
}
console.log("Okay, bye bye.");
process.exit();
