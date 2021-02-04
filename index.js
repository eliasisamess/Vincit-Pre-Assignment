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

let firstDay;
let lastDay;
// A = 1
// B = 0
// C = 5
let mode;
let path;
if (process.argv.length > 4) {
  path = process.argv[2];
  mode = parseInt(process.argv[3]);
  firstDay = new Date(process.argv[4]);
  lastDay = new Date(process.argv[5]);
} else {
  path = "HistoricalQuotes.csv";
  mode = 0;
  firstDay = new Date("01/01/2013");
  lastDay = new Date("01/01/2020");
}
// console.log(process.ar);

console.log("Welcome to MVP stock analysist");
console.log(
  `Date range is ${firstDay.toDateString()} and ${lastDay.toDateString()}`
);

main();
