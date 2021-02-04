// START HERE
const finders = require("./myFunctions.js");
const helpers = require("./myFunctions.js");

async function main() {
  let data = await finders.readFileToJson(path);
  let result;
  if (mode === 1) {
    await finders.longestTrends(data, firstDay, lastDay, mode);
  } else if (mode === 0) {
    result = await finders.volumesAndPriceChanges(
      data,
      firstDay,
      lastDay,
      mode
    );
  } else if (mode === 5) {
    result = await finders.bestSMA5(data, firstDay, lastDay, mode);
  }
}

let firstDay = new Date("01/01/2013");
let lastDay = new Date("01/01/2020");

// A = 1
// B = 0
// C = 5
let mode;
if (process.argv.length > 2) {
  mode = parseInt(process.argv[2]);
} else {
  mode = 0;
}
// console.log(process.ar);

console.log("Welcome to MVP stock analysist");
console.log(
  `Date range is ${firstDay.toDateString()} and ${lastDay.toDateString()}`
);
const path = "HistoricalQuotes.csv";
console.log("using " + path);

main();
