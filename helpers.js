// Count and format functions are returning values as toFixed(5), because Nasdaq
// recommends to use 5 decimals in most scenarios:
// https://www.nasdaq.com/docs/rec-indexation-coefficient.pdf

function InvalidDatesException(message) {
  this.message = message;
  this.name = "ERROR! Given dates not found in data.";
}

const checkCustomDates = (array, mode, dates, meta) => {
  let newDates = dates;
  // console.log(`checking dates now`);
  // console.log("custom dates selected, finding indexes");
  newDates.base.firstIndex = array.findIndex(
    (item) => item.Date.getTime() >= dates.base.first.getTime()
  );
  if (dates.base.last.getTime() < meta.lastTime) {
    newDates.base.lastIndex =
      array.findIndex(
        (item) => item.Date.getTime() > dates.base.last.getTime()
      ) - 1;
  } else {
    newDates.base.lastIndex = meta.lastIndex;
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
  // } else {
  // console.log("validation successful, now searching entriesByDate");
  let chosenEntries = [];
  let addExtras = mode != 0 ? true : false;
  for (let i = dates.base.firstIndex; i < dates.base.lastIndex + 1; i++) {
    // console.log(`round ${i}`);
    if (addExtras && i === dates.base.firstIndex) {
      for (let j = mode; j >= 0; j--) {
        chosenEntries.push(array[i - j]);
        // console.log(
        //   `add extras so push pre's and first ${array[
        //     i - j
        //   ].Date.toDateString()}`
        // );
      }
    } else if (
      !addExtras &&
      array[i].Date.getTime() === dates.base.first.getTime()
    ) {
      chosenEntries.push(array[i]);
      // console.log(
      //   `dont add extras so pushed first ${array[i].Date.toDateString()}`
      // );
    } else if (
      array[i].Date.getTime() > dates.base.first.getTime() &&
      array[i].Date.getTime() < dates.base.last.getTime()
    ) {
      chosenEntries.push(array[i]);
      // console.log(`added days between ${array[i].Date.toDateString()}`);
    } else if (array[i].Date.getTime() === dates.base.last.getTime()) {
      chosenEntries.push(array[i]);
      // console.log(`added last ${array[i].Date.toDateString()}`);
    }
  }
  return chosenEntries;
  // }
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

const validateDates = (array, mode, dates, index) => {
  // console.log("validating dates");
  // console.log(`mode is ${mode} and index ${index}`);
  // This includes metainformation of the given array
  let meta = {
    firstDateTime: array[0].Date.getTime(),
    lastDateTime: array[array.length - 1].Date.getTime(),
    firstDateString: array[0].Date.toDateString(),
    lastDateString: array[array.length - 1].Date.toDateString(),
    lastIndex: array.length - 1,
    modeFirstDateTime: array[mode].Date.getTime(),
    modeFirstDateString: array[mode].Date.toDateString(),
  };
  // console.log(meta);
  if (!dates.custom) {
    dates.base.first = array[mode].Date;
    dates.base.last = array[array.length - 1].Date;
    dates.base.firstIndex = mode;
    dates.base.lastIndex = array.length - 1;
    // console.log(
    //   "automatically adjusted starting day to " +
    //     dates.base.first.toDateString() +
    //     " and ending day to " +
    //     dates.base.last.toDateString() +
    //     " and indexes to " +
    //     dates.base.firstIndex +
    //     dates.base.lastIndex
    // );
  } else {
    // console.log("custom dates found so lets validate here");

    let givenFirstDateTime = dates.base.first.getTime();
    let givenLastDateTime = dates.base.last.getTime();
    let givenFirstDateString = dates.base.first.toDateString();
    let givenLastDateString = dates.base.last.toDateString();

    if (givenFirstDateTime < meta.firstDateTime) {
      throw new InvalidDatesException(
        `ERROR! Starting day ${givenFirstDateString} not available in data. First available date is ${meta.firstDateString} `
      );
    } else if (givenLastDateTime > meta.lastDateTime) {
      throw new InvalidDatesException(
        `ERROR! Ending day ${givenLastDateString} not available in data. Last available date is ${meta.lastDateString} `
      );
    } else if (givenFirstDateTime < meta.modeFirstDateTime) {
      throw new InvalidDatesException(
        `ERROR! Starting day ${givenFirstDateString} not available in data for this mode. First available date for mode ${index} is ${meta.modeFirstDateString} `
      );
    } else if (
      givenFirstDateTime != meta.modeFirstDateTime ||
      givenLastDateTime != meta.lastDateTime
    ) {
      dates = checkCustomDates(array, mode, dates, meta);
    }
  }
  return dates;
};

export {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
  entriesByDate,
  formatDataArray,
  validateDates,
};
