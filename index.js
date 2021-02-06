import readlineSync from "readline-sync";
import csv from "csvtojson";
import { longestTrends, volumesAndPriceChanges, bestSMA5 } from "./finders.js";
import { entriesByDate, formatDataArray, validateDates } from "./helpers.js";

const analyzeStockData = (selected, mode, dates) => {
  if (mode == 1) {
    longestTrends(selected, dates);
  } else if (mode == 0) {
    volumesAndPriceChanges(selected, dates);
  } else if (mode == 5) {
    bestSMA5(selected, dates);
  }
};

let data;
let mode;
let path;
let fileFirstEntry;
let fileLastEntry;
let firstTime = true;
let dates = {
  custom: null,
  base: {
    first: {},
    last: {},
    firstIndex: -1,
    lastIndex: -1,
  },
  modes: [
    {
      first: {},
      last: {},
      firstIndex: -1,
      lastIndex: -1,
    },
    {
      first: {},
      last: {},
      firstIndex: -1,
      lastIndex: -1,
    },
    {
      first: {},
      last: {},
      firstIndex: -1,
      lastIndex: -1,
    },
  ],
};
let sameDates = false;
let startOver = true;
let stillAnalyzing = true;

path = "test_data/Test1.csv";

console.log("Welcome to your personal stock analysist Mr. McDuck!");
while (stillAnalyzing) {
  if (startOver) {
    console.log("now choosing file");
    // path = readlineSync.question(
    //   "Please provide the name of a csv file to import data from: "
    // );
    console.log("selected file " + path);
    data = await csv().fromFile(path);
    data = formatDataArray(data);
    console.log("data formatted");
    fileFirstEntry = new Date(data[0].Date);
    fileLastEntry = new Date(data[data.length - 1].Date);
    console.log(
      `Date range of stock entries in file "${path}" is ${fileFirstEntry.toDateString()} - ${fileLastEntry.toDateString()}`
    );
  }
  // console.log(
  //   `Ready to analyze "${path}" with a date range of ${dates.first.toDateString()} - ${dates.last.toDateString()}`
  // );
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
    console.log("Okay, bye bye.");
    process.exit();
  }
  // if (
  //   !firstTime &&
  //   readlineSync.keyInYN(
  //     `Keep the same date range as before? (${dates.first.toDateString()} - ${dates.last.toDateString()})`
  //   )
  // ) {
  //   sameDates = true;
  // } else {
  //   sameDates = false;
  // }
  try {
    if (!sameDates) {
      if (
        readlineSync.keyInYN(
          "Do you want to provide a custom date range within the data?"
        )
      ) {
        dates.custom = true;
        (dates.base.first = new Date(
          readlineSync.question(`Provide a starting day (m/d/y): `)
        )),
          (dates.base.last = new Date(
            readlineSync.question(`Provide an ending day (m/d/y): `)
          ));
      } else {
        console.log(
          "setting uncustom " + fileFirstEntry + " and " + fileLastEntry
        );
        dates.custom = false;
        dates.base.first = fileFirstEntry;
        dates.base.last = fileLastEntry;
      }
    }
    dates = validateDates(data, mode, dates, index);
    let selected = entriesByDate(data, mode, dates);
    analyzeStockData(selected, mode, dates);
  } catch (err) {
    console.log(err.name);
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
