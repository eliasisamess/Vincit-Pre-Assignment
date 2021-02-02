// Pseudo

// 1. Import and process CSV Data
// 2. Define what to look for from the Data
// 3. Return output

const csv = require("csvtojson");

function printAll(obj) {
  console.log("printing all");
  obj.forEach((entry) =>
    console.log(
      `${entry.Date.toDateString()} ${entry["Close/Last"]} ${entry.Volume} ${
        entry.Open
      } ${entry.High} ${entry.Low} `
    )
  );
}

function formatStockMoney(string) {
  let formatted = string.replace("$", "");
  formatted = parseFloat(formatted);
  console.log(`formatting stock money ${string} to ${formatted}`);
  return formatted.toFixed(5);
}

function countPercentageDifference(a, b) {
  console.log(
    `Counting percentage difference between ${a} and ${b} which is ${
      (a / b) * 100 - 100
    }`
  );
  let result = (a / b) * 100 - 100;

  return result;
}

function countSimpleMovingAverage(array) {
  // console.log(`Counting simple moving average now`);
  let sum = 0;
  array.forEach((item) => {
    sum = parseFloat(sum) + parseFloat(item);
    console.log(`item is now ${item} and sum is ${sum}`);
  });
  let result = sum / array.length;
  return result.toFixed(5);
}

function findBestSMA5(array) {
  console.log("Finding best sma5");
  let listOfResults = {};
  let startingIndex = 5;
  for (let i = startingIndex; i < array.length; i++) {
    let current;
    // console.log(
    //   `Today is ${array[i].Date.toDateString()} and opening price is ${
    //     array[i].Open
    //   }`
    // );
    let tempArray = [];
    for (let j = 5; j > 0; j--) {
      tempArray.push(array[i - j].Open);
      console.log(
        `Pushed ${array[i - j].Date.toDateString()} (${
          array[i - j].Open
        }) to tempArray`
      );
    }
    current = countSimpleMovingAverage(tempArray);
    console.log(
      `Day is ${array[i].Date.toDateString()} open is ${
        array[i].Open
      } and SMA5 is ${current}`
    );
    listOfResults.push({
      Date: array[i].Date,
      Open: array[i].Open,
      SMA5: current,
      Diff: countPercentageDifference(array[i].Open, current),
    });
  }
  console.log("Here is a list of results:");
  listOfResults.forEach((item) =>
    console.log(`Date: ${item.Date.toDateString()} Open: `)
  );
}

function findTradingVolume(array) {}

function findPriceChanges(array) {}
// Returns longest bullish (upwards) trends during given time range.
function findLongestTrends(array) {
  // This variable will include the (first) longest trend from given time range
  // and others that are the same length
  let longest = {
    firstTrendLength: 0,
    firstStartingDay: {},
    firstEndingDay: {},
    others: [],
  };

  // findEntriesByDate function will search for either 1 or 5 entries before
  // the given time range starts, according to if one is looking for either
  // upward trends (this function) or best price to SMA 5 (findBestSMA5 function)
  let startingIndex = 1;
  let trend = 0;

  // We go through the array using for loop and search for trends
  for (let i = startingIndex; i < array.length; i++) {
    // Declare closing prices of this round (i)
    let closingToday = array[i]["Close/Last"];
    let closingYesterday = array[i - 1]["Close/Last"];

    // // START OF TEST LOGS
    // console.log(
    //   `Today is ${array[
    //     i
    //   ].Date.toDateString()} and closing is ${closingToday} vs ${closingYesterday} (${array[
    //     i - 1
    //   ].Date.toDateString()})`
    // );
    // // END OF TEST LOGS

    // If todays price is higher than yesterday, we start a new trend
    if (closingToday > closingYesterday) {
      trend++;

      // // START OF TEST LOGS
      // if (trend === 0) {
      //   console.log(`New trend has started on ${array[i].Date.toDateString()}`);
      // }
      // console.log(`Current trend length is now ${trend} days.`);
      // // END OF TEST LOGS

      // If todays price is lower than yesterday, we end the trend
    } else if (closingToday < closingYesterday) {
      // If the ended trend was longer than current longest, we set a new first
      // and clear the others (since they've been shorter, if set already)
      if (longest.firstTrendLength < trend) {
        longest.firstTrendLength = trend;
        longest.firstStartingDay = array[i - trend].Date;
        longest.firstEndingDay = array[i - 1].Date;
        longest.others = [];

        // // START OF TEST LOGS
        // console.log(`First longest trend set to ${longest.firstTrendLength}.`);
        // console.log(
        //   `First longest trend range set to ${longest.firstStartingDay} - ${longest.firstEndingDay}.`
        // );
        // console.log("Cleared the others because new longest trend was set.");
        // // END OF TEST LOGS
        //
        // If the ended trend was as long as the first longest, we add current
        // trend to others[] array.
      } else if (longest.firstTrendLength === trend) {
        // console.log(`Found trend as long (${trend}) as the current longest (${longest.firstTrendLength}) and added it to others[]`)
        longest.others.push({
          trendLength: trend,
          startingDay: array[i - trend].Date,
          endingDay: array[i - 1].Date,
        });
      }
      // If current trend ended, clear it before next round
      trend = 0;
    }
  }
  console.log(
    `Finished looking for trends. During given timerange (${array[
      startingIndex
    ].Date.toDateString()} - ${array[
      array.length - 1
    ].Date.toDateString()}) the longest trend was ${
      longest.firstTrendLength
    } days and there were ${longest.others.length} other similar trends:`
  );
  console.log(
    `${longest.firstStartingDay.toDateString()} - ${longest.firstEndingDay.toDateString()}`
  );
  longest.others.forEach((item) =>
    console.log(
      `${item.startingDay.toDateString()} - ${item.endingDay.toDateString()}`
    )
  );
}

// Returns all entries from object between given date range and also dates before the start day, according to mode (how many past entries)
// Throws error if time range doesn't match with given data.
async function findEntriesByDate(obj, start, end, mode) {
  let chosenEntries = [];
  // Format each entry to date objects, integers and floats
  obj.forEach((item) => {
    item.Date = new Date(item.Date);
    item["Close/Last"] = formatStockMoney(item["Close/Last"]);
    item.Volume = parseInt(item.Volume);
    item.Open = formatStockMoney(item.Open);
    item.High = formatStockMoney(item.High);
    item.Low = formatStockMoney(item.Low);
  });
  obj.sort(function (a, b) {
    return a.Date - b.Date;
  });
  if (start.getTime() < obj[0].Date.getTime()) {
    throw new Error("Dates don't match");
  }
  // Find array objects during
  for (let i = 0; i < obj.length; i++) {
    if (obj[i].Date.getTime() === start.getTime()) {
      for (let j = mode; j >= 0; j--) {
        chosenEntries.push(obj[i - j]);
      }
    } else if (obj[i].Date >= start && obj[i].Date <= end) {
      chosenEntries.push(obj[i]);
    }
  }
  return chosenEntries;
}

// Read csv file to json
async function readFileToJson(file) {
  let entries = await csv().fromFile(file);
  // console.log(JSON.stringify(entries));
  return entries;
}

// START HERE

let firstDay = new Date("02/05/2020");
let lastDay = new Date("01/29/2021");

// A = 1
// B = 0
// C = 5
let mode = 5;

console.log("Welcome to MVP stock analysist");
console.log(
  `Date range is ${firstDay.toDateString()} and ${lastDay.toDateString()}`
);
const path = "HistoricalQuotes-2.csv";
console.log("using " + path);
// readFileToJson(path).then((result) =>
//   findEntriesByDate(result, firstDay, lastDay, mode).then((toPrint) => {
//     // printAll(toPrint);
//     // findLongestTrends(toPrint);
//     findBestSMA5(toPrint);
//   })
// );

// // TESTING formatStockMoney function
// let temp = "$136.092";
// console.log(`annetaan ${temp}`);
// let temp2 = formatStockMoney(temp);
// console.log(`siitä tuli ${temp2}`);

// // TESTING countPercentageDifference function
// let open = 250;
// let sma = 200;
// let res = countPercentageDifference(open, sma);
// console.log(res.toFixed(2) + "%");
// HUOM! Jos annetaan alkupäiväksi sama kuin mistä csv alkaa, tulee ongelma kun jossain oli se i-1 indexi, eli TypeError: Cannot read property 'Close/Last' of undefined
