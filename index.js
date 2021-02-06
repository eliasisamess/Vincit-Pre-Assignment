import readlineSync from "readline-sync";
import csv from "csvtojson";
import { analyzeStockData } from "./finders.js";
import { entriesByDate, formatDataArray, validateDates } from "./helpers.js";

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

// path = "test_data/Test3.csv";

while (stillAnalyzing) {
  let errorStatus = false;
  if (firstTime) {
    console.log("Welcome to your personal stock analysist Mr. McDuck!");
  }
  if (startOver) {
    // console.log("now choosing file");
    path = readlineSync.question(
      "Please provide the name of a csv file to import data from: "
    );
    // console.log("selected file " + path);
    data = await csv().fromFile(path);
    data = formatDataArray(data);
    // console.log("data formatted");
    fileFirstEntry = new Date(data[0].Date);
    fileLastEntry = new Date(data[data.length - 1].Date);
  }
  // console.log(
  //   `Ready to analyze "${path}" with a date range of ${dates.first.toDateString()} - ${dates.last.toDateString()}`
  // );
  console.log(
    `Date range of stock entries in file "${path}" is ${fileFirstEntry.toDateString()} - ${fileLastEntry.toDateString()}`
  );
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
  try {
    if (!sameDates) {
      if (
        readlineSync.keyInYN(
          "Do you want to provide a custom date range within the data?"
        )
      ) {
        let validDate = false;
        while (!validDate) {
          try {
            dates.custom = true;
            (dates.base.first = new Date(
              readlineSync.question(`Provide a starting date (m/d/y): `)
            )),
              (dates.base.last = new Date(
                readlineSync.question(`Provide an ending date (m/d/y): `)
              ));
            if (
              Object.prototype.toString.call(dates.base.first) ===
              "[object Date]"
            ) {
              // it is a date
              if (isNaN(dates.base.first.getTime())) {
                throw new TypeError(
                  "ERROR! Not a valid starting date, please try again."
                );
              } else if (isNaN(dates.base.last.getTime())) {
                throw new TypeError(
                  "ERROR! Not a valid ending date, please try again."
                );
              } else {
                validDate = true;
              }
            } else {
              throw new TypeError("ERROR! Not a date, please try again.");
            }
          } catch (err) {
            console.log(err.message);
          }
        }
      } else {
        // console.log(
        //   "setting uncustom " + fileFirstEntry + " and " + fileLastEntry
        // );
        dates.custom = false;
        dates.base.first = fileFirstEntry;
        dates.base.last = fileLastEntry;
      }
    }
    dates = validateDates(data, mode, dates, index);
    let selected = entriesByDate(data, mode, dates);
    analyzeStockData(selected, mode, dates);
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
