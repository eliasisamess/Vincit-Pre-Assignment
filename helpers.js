// Each helper functions are returning values as toFixed(5), because Nasdaq
// recommends to use 5 decimals in most scenarios:
// https://www.nasdaq.com/docs/rec-indexation-coefficient.pdf
const formatStockMoney = (string) => {
  let formatted = string.replace("$", "");
  formatted = parseFloat(formatted);
  return formatted.toFixed(5);
};
const countDifference = (a, b) => {
  let result = a - b;
  return result.toFixed(5);
};
const countPercentageDifference = (a, b) => {
  let result = (a / b) * 100 - 100;
  return result.toFixed(5);
};
const countSimpleMovingAverage = (array) => {
  let sum = 0;
  array.forEach((item) => {
    sum = parseFloat(sum) + parseFloat(item);
  });
  let result = sum / array.length;
  return result.toFixed(5);
};
const checkDates = (array, mode, dates) => {
  let indexArray = [];
  console.log(`checking dates now`);

  if (dates.custom) {
    console.log("custom dates selected, finding indexes");
    indexArray.push(
      array.findIndex((item) => item.Date.getTime() >= dates.first.getTime())
    );
    indexArray.push(
      array.findIndex((item) => item.Date.getTime() > dates.last.getTime()) - 1
    );
  } else {
    indexArray = [mode, array.length - 1];
  }
  return indexArray;
};

export {
  formatStockMoney,
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
  checkDates,
};
