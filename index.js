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

function findLongestTrend(array) {
  let longestTrend;
  let startingIndex = 1;
  let trend = 0;
  for (let i = startingIndex; i < array.length; i++) {
    let closingToday = array[i]["Close/Last"];
    let closingYesterday = array[i - 1]["Close/Last"];
    console.log(
      `Today is ${array[
        i
      ].Date.toDateString()} and closing is ${closingToday} vs ${closingYesterday}`
    );
    if (closingToday > closingYesterday) {
      trend++;
      console.log("trend is now " + trend);
      longestTrend = trend;
    } else if (closingToday < closingYesterday) {
      console.log(
        `putting trend to 0 closing is ${closingToday} vs yesterday ${closingYesterday}`
      );

      trend = 0;
    }
  }
  console.log("after for loop longest trend is " + longestTrend);

  // console.log("longest trend found was " + best);
  // for (let i = 1; i < array.length; i++) {
  //   let today = array[i]["Close/Last"];
  //   let yesterday = array[i - 1]["Close/Last"];
  //   //    let tomorrow = array[i + 1]["Close/Last"];
  //   if (today > yesterday) {
  //     console.log(
  //       `Today is ${array[i].Date} and closing is ${today} vs ${yesterday}`
  //     );
  //     longestTrend++;
  //     console.log(`longest trend is now ${longestTrend}`);
  //   }
  //   // if (tomorrow < today) {
  //   //   longestTrend = 0;
  //   // }
  // }
}

// Returns all entries from object between given date range
async function findEntriesByDate(obj, start, end, mode) {
  let chosenEntries = [];
  let daysToSubtract = mode;
  obj.forEach((x) => {
    console.log("changing " + x.Date);
    x.Date = new Date(x.Date);
  });
  obj.sort(function (a, b) {
    return a.Date - b.Date;
  });
  printAll(obj);
  console.log("days to subtract " + daysToSubtract);

  //  let start = new Date(startDate);
  //    let end = new Date(endDate);
  //  start.setDate(start.getDate() - daysToSubtract);
  for (let i = 0; i < obj.length; i++) {
    let a = new Date(obj[i].Date);
    if (a <= end && a >= start) {
      obj[i].Date = a;
      chosenEntries.push(obj[i]);
      console.log("added " + obj[i].Date.toDateString() + " to array");
    }
  }
  chosenEntries.sort(function (a, b) {
    return a.Date - b.Date;
  });
  return chosenEntries;
}

async function readFileToJson(file) {
  let entries = await csv().fromFile(file);
  // let b = await findEntriesByDate(a, firstDay, lastDay);
  // return longestTrend(await read(file));
  return entries;
}

// START HERE

let firstDay = new Date("01/05/2021");
let lastDay = new Date("01/19/2021");

// a = 1
// b = 0
// c = 5
let mode = 1;

console.log("Welcome to MVP stock analysist");
console.log(
  `Date range is ${firstDay.toDateString()} and ${lastDay.toDateString()}`
);
const path = "HistoricalQuotes-2.csv";
console.log("Reading now");
readFileToJson(path).then((result) =>
  findEntriesByDate(result, firstDay, lastDay, mode).then((toPrint) => {
    //    printAll(toPrint);
    findLongestTrend(toPrint);
  })
);
