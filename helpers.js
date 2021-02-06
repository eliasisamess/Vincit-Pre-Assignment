// Count and format functions are returning values as toFixed(5), because Nasdaq
// recommends to use 5 decimals in most scenarios:
// https://www.nasdaq.com/docs/rec-indexation-coefficient.pdf

function InvalidDatesException(message) {
  this.message = message;
  this.name = "ERROR! Invalid dates exception";
}

const InvalidUserInput = (message) => {
  this.message = message;
  this.name = "InvalidDatesException";
};

const checkDates = (array, mode, dates) => {
  let newDates = dates;
  console.log(`checking dates now`);
  if (dates.custom) {
    console.log("custom dates selected, finding indexes");
    newDates.firstIndex = array.findIndex(
      (item) => item.Date.getTime() >= dates.first.getTime()
    );
    newDates.lastIndex =
      array.findIndex((item) => item.Date.getTime() > dates.last.getTime()) - 1;
  } else {
    newDates.firstIndex = mode;
    newDates.first = array[newDates.firstIndex].Date;
    newDates.lastIndex = array.length - 1;
    console.log(
      `no custom dates selected, set firstIndex ${newDates.firstIndex} and last ${newDates.lastIndex}`
    );
  }
  return newDates;
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

// ENTRIES BY DATE
// Returns all entries from object between given date range and also dates
// before the starting day, if needed, according to mode settings
const entriesByDate = (array, mode, dates) => {
  dates = checkDates(array, mode, dates);
  console.log(`mode is ${mode}`);
  console.log("dates.first " + dates.first.toDateString());
  console.log("dates.last " + dates.last.toDateString());
  console.log("dates.firstIndex" + dates.firstIndex);
  // console.log(array[dates.firstIndex].Date.toDateString());
  let firstDayTime = dates.first.toDateString();
  console.log(firstDayTime);
  let firstInArr = array[mode].Date.toDateString();
  console.log(firstInArr);
  if (dates.first.getTime() < array[dates.firstIndex].Date.getTime()) {
    throw new InvalidDatesException(
      `Not enough data for this mode with the given starting day. First available date for this mode is ${array[
        mode
      ].Date.toDateString()}`
    );
  } else if (dates.last.getTime() > array[array.length - 1]) {
    throw new InvalidDatesException(
      `Not enough data with the given ending day. Last available date is ${array[
        array.length - 1
      ].Date.toDateString()}`
    );
  } else {
    console.log("validation successful, now searching entriesByDate");
    let chosenEntries = [];
    let addExtras = mode != 0 ? true : false;
    for (let i = dates.firstIndex; i < dates.lastIndex + 1; i++) {
      console.log(`round ${i}`);
      if (addExtras && i === dates.firstIndex) {
        for (let j = mode; j >= 0; j--) {
          chosenEntries.push(array[i - j]);
          console.log(
            `add extras so push pre's and first ${array[
              i - j
            ].Date.toDateString()}`
          );
        }
      } else if (
        !addExtras &&
        array[i].Date.getTime() === dates.first.getTime()
      ) {
        chosenEntries.push(array[i]);
        console.log(
          `dont add extras so pushed first ${array[i].Date.toDateString()}`
        );
      } else if (
        array[i].Date.getTime() > dates.first.getTime() &&
        array[i].Date.getTime() < dates.last.getTime()
      ) {
        chosenEntries.push(array[i]);
        console.log(`added days between ${array[i].Date.toDateString()}`);
      } else if (array[i].Date.getTime() === dates.last.getTime()) {
        chosenEntries.push(array[i]);
        console.log(`added last ${array[i].Date.toDateString()}`);
      }
    }
    return chosenEntries;
  }
};

const formatDataArray = (array) => {
  let temp = [];
  array.forEach((item) => {
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
  return temp;
};

const formatStockMoney = (string) => {
  let formatted = string.replace("$", "");
  formatted = parseFloat(formatted);
  return formatted.toFixed(5);
};

export {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
  entriesByDate,
  formatDataArray,
};
