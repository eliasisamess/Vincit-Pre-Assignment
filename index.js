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

// Returns longest bullish (upwards) trends during given time range.
function findLongestTrend(array) {
  let longest = {
    trendLength: 0,
    firstStartingDay: {},
    firstEndingDay: {},
    others: [],
  };
  let startingIndex = 1;
  let trend = 0;
  for (let i = startingIndex; i < array.length; i++) {
    let closingToday = array[i]["Close/Last"];
    let closingYesterday = array[i - 1]["Close/Last"];
    // console.log(
    //   `Today is ${array[
    //     i
    //   ].Date.toDateString()} and closing is ${closingToday} vs ${closingYesterday} (${array[
    //     i - 1
    //   ].Date.toDateString()})`
    // );
    if (closingToday > closingYesterday) {
      // if (trend === 0) {
      //   console.log("New trend has started on " + array[i].Date.toDateString());
      // }
      trend++;
      // console.log("trend is now " + trend);
    } else if (closingToday < closingYesterday) {
      if (longest.trendLength < trend) {
        longest.trendLength = trend;
        console.log("longest trend set to " + longest.trendLength);
        longest.firstStartingDay = array[i - trend].Date;
        console.log(
          "longest trend startingDay set to " + longest.firstStartingDay
        );
        longest.firstEndingDay = array[i - 1].Date;
        console.log("longest trend endingDay set to " + longest.firstEndingDay);
        longest.others = [];
        console.log("cleared the others because new longest trend was set");
      } else if (longest.trendLength === trend) {
        // console.log("okay now " + longest.trendLength + trend);
        longest.others.push({
          trendLength: trend,
          startingDay: array[i - trend].Date,
          endingDay: array[i - 1].Date,
        });
      }
      trend = 0;
    }
  }
  console.log(
    "During given timerange, longest trend was " +
      longest.trendLength +
      " days and there were " +
      longest.others.length +
      " other trends as long."
  );
  console.log(
    "First one started on " +
      longest.firstStartingDay.toDateString() +
      " and ended on " +
      longest.firstEndingDay.toDateString()
  );
  console.log("others were:");
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
  obj.forEach((x) => {
    x.Date = new Date(x.Date);
  });
  obj.sort(function (a, b) {
    return a.Date - b.Date;
  });
  if (start.getTime() < obj[0].Date.getTime()) {
    throw new Error("Dates don't match");
  }
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

async function readFileToJson(file) {
  let entries = await csv().fromFile(file);
  // let b = await findEntriesByDate(a, firstDay, lastDay);
  // return longestTrend(await read(file));
  return entries;
}

// START HERE

let firstDay = new Date("02/01/2011");
let lastDay = new Date("01/29/2021");

// A = 1
// B = 0
// C = 5
let mode = 1;

console.log("Welcome to MVP stock analysist");
console.log(
  `Date range is ${firstDay.toDateString()} and ${lastDay.toDateString()}`
);
const path = "HistoricalQuotes.csv";
console.log("using " + path);
readFileToJson(path).then((result) =>
  findEntriesByDate(result, firstDay, lastDay, mode).then((toPrint) => {
    //    printAll(toPrint);
    findLongestTrend(toPrint);
  })
);

// HUOM! Jos annetaan alkupäiväksi sama kuin mistä csv alkaa, tulee ongelma kun jossain oli se i-1 indexi, eli TypeError: Cannot read property 'Close/Last' of undefined
