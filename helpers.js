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

export {
  formatStockMoney,
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
};
