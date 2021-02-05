import {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
  formatStockMoney,
  checkDates,
} from "./helpers.js";

import { entriesByDate } from "./finders.js";
import csv from "csvtojson";

let dates = {
  custom: true,
  first: new Date(2020, 10, 1),
  last: new Date(2020, 10, 30),
};
function printAll(obj) {
  console.log("printing all");
  obj.forEach((entry) =>
    console.log(
      `${entry.Date.toDateString()} ${entry.Close} ${entry.Volume} ${
        entry.Open
      } ${entry.High} ${entry.Low} `
    )
  );
}
console.log(dates.first.toDateString());
console.log(dates.last.toDateString());

let mode = 5;

let test = await csv().fromFile("HistoricalQuotes-2.csv");
let temp = [];
test.forEach((item) => {
  temp.push({
    Date: new Date(item.Date),
    Close: formatStockMoney(item["Close/Last"]),
    Volume: parseInt(item.Volume),
    Open: formatStockMoney(item.Open),
    High: formatStockMoney(item.High),
    Low: formatStockMoney(item.Low),
  });
});

temp.sort((a, b) => {
  return a.Date - b.Date;
});

let a = checkDates(temp, mode, dates);
console.log(a);
console.log(temp[a[0]].Date);
console.log(temp[a[1]].Date);

let selected = entriesByDate(test, mode, dates);
printAll(selected);
