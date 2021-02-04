const readlineSync = require("readline-sync");
const finders = require("./myFunctions.js");

async function analyzeStocks(data, mode, dates) {
  try {
    console.log("going to find entries");
    let selected = [];
    selected = finders.entriesByDate(data, mode, dates);

    if (mode == 1) {
      await finders.longestTrends(selected);
    } else if (mode == 0) {
      await finders.volumesAndPriceChanges(selected);
    } else if (mode == 5) {
      await finders.bestSMA5(selected);
    } else {
      console.log("no mode or wrong mode selected");
    }
  } catch (err) {
    throw err;
    // console.log("An error occured, could not provide results.");
  }
}

async function main() {
  let path;
  let stillAnalyzing = true;
  let startOver = true;
  let data = [];
  let mode;
  let dates = { custom: false, first: {}, last: {} };
  path = "HistoricalQuotes.csv";
  console.log("Welcome to MVP stock analysist");

  while (stillAnalyzing) {
    if (startOver) {
      console.log("now choosing file");
      // (path = readlineSync.question(
      //   "Please provide the name of a csv file (located in this folder): "
      // )),
      console.log("selected file " + path);
      try {
        data = await finders.readFileToJson(path);
        let fileFirst = new Date(data[0].Date);
        let fileLast = new Date(data[data.length - 1].Date);
        console.log(
          `File read succesfully. Date range of entries is ${
            fileFirst.getTime() < fileLast.getTime()
              ? fileFirst.toDateString()
              : fileLast.toDateString()
          } - ${
            fileFirst.getTime() < fileLast.getTime()
              ? fileLast.toDateString()
              : fileFirst.toDateString()
          }`
        );
      } catch {
        console.log(
          `An error occured, file not found or includes invalid stock data.`
        );
      }
    }
    if (
      readlineSync.keyInYN(
        "Do you want to provide a custom date range within the data?"
      )
    ) {
      dates.custom = true;
      (dates.first = new Date(
        readlineSync.question(`Provide a starting day (m/d/y): `)
      )),
        (dates.last = new Date(
          readlineSync.question(`Provide an ending day (m/d/y): `)
        ));
    } else {
      dates.custom = false;
      dates.first = {};
      dates.last = {};
    }
    console.log(`first is ${dates.first}`);
    console.log(`last is ${dates.last}`);
    (modes = [
      "Find bullish (upward) trends",
      "Find highest trading volumes and most significant price changes within a day",
      "Find which dates had the best opening price compared to 5 days simple moving average",
    ]),
      (index = readlineSync.keyInSelect(
        modes,
        "In which mode do you want to analyze this data?"
      ));
    console.log(`Ok, mode ${index + 1} selected`);
    index === 0
      ? (mode = 1)
      : index === 1
      ? (mode = 0)
      : index === 2
      ? (mode = 5)
      : console.log("ei sit");

    console.log(`chosen mode is ${mode}`);
    await analyzeStocks(data, mode, dates);

    if (
      readlineSync.keyInYN(
        `Do you want to continue analyzing this file "${path}"?`
      )
    ) {
      // 'Y' key was pressed.
      startOver = false;
      console.log("Okay, lets start again.");
      // Do something...
    } else {
      // Another key was pressed.
      if (readlineSync.keyInYN(`Do you want to continue with another file?`)) {
        // 'Y' key was pressed.
        startOver = true;
        stillAnalyzing = true;
        // Do something...
      } else {
        startOver = false;
        stillAnalyzing = false;
      }
    }
  }
  console.log("Okay, bye bye.");
  process.exit();
}

main();
