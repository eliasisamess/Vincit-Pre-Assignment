// Count and format functions are returning values as toFixed(5), because Nasdaq
// recommends to use 5 decimals in most scenarios:
// https://www.nasdaq.com/docs/rec-indexation-coefficient.pdf

function InvalidDatesException(message) {
  this.message = message;
  this.name = "Error: Date validation failed.";
}

const checkCustomDates = (array, mode, dates, meta) => {
  let foundFirstIndex;
  let foundFirstDateTime;
  let foundLastIndex;
  for (let i = 0; i < array.length; i++) {
    if (array[i].Date.getTime() === meta.givenFirstDateTime) {
      foundFirstIndex = i;
      foundFirstDateTime = array[i].Date.getTime();
      break;
    } else if (array[i].Date.getTime() > meta.givenFirstDateTime) {
      foundFirstIndex = i;
      foundFirstDateTime = array[i].Date.getTime();
      break;
    }
  }
  for (let i = 0; i < array.length; i++) {
    if (array[i].Date.getTime() === meta.givenLastDateTime) {
      foundLastIndex = i;
      break;
    } else if (array[i].Date.getTime() > meta.givenLastDateTime) {
      foundLastIndex = i - 1;
      break;
    }
  }
  if (
    array[foundFirstIndex].Date.getTime() >=
    array[foundLastIndex].Date.getTime()
  ) {
    throw new InvalidDatesException(
      `Not enough data available between given dates.`
    );
  } else {
    dates.base.firstIndex = foundFirstIndex;
    dates.base.lastIndex = foundLastIndex;
  }
  return dates;
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
  let chosenEntries = [];
  for (let i = dates.base.firstIndex; i <= dates.base.lastIndex; i++) {
    if (i === dates.base.firstIndex) {
      for (let j = mode; j >= 0; j--) {
        chosenEntries.push(array[i - j]);
      }
    } else {
      chosenEntries.push(array[i]);
    }
  }
  return chosenEntries;
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

const isValidDate = (input, array, mode, index, isStart, startInput) => {
  let meta = {
    firstDateTime: array[0].Date.getTime(),
    lastDateTime: array[array.length - 1].Date.getTime(),
    firstDateString: array[0].Date.toDateString(),
    lastDateString: array[array.length - 1].Date.toDateString(),
    lastIndex: array.length - 1,
    secondToLastDateTime: array[array.length - 2].Date.getTime(),
    secondToLastDateString: array[array.length - 2].Date.toDateString(),
    modeFirstDateTime: array[mode].Date.getTime(),
    modeFirstDateString: array[mode].Date.toDateString(),
  };
  let validateInput = new Date(input);

  if (Object.prototype.toString.call(validateInput) === "[object Date]") {
    if (isNaN(validateInput.getTime())) {
      throw new InvalidDatesException(
        `"${input}" is not a valid ${
          isStart ? "starting" : "ending"
        } date, please try again.`
      );
    }
  } else {
    throw new InvalidDatesException(
      "Not a proper date object, please try again and follow the instructions."
    );
  }
  let givenDateTime = validateInput.getTime();
  let givenDateString = validateInput.toDateString();
  if (isStart && givenDateTime < meta.firstDateTime) {
    throw new InvalidDatesException(
      `Given date ${givenDateString} not available in data. First available date for mode ${
        index + 1
      } is ${meta.modeFirstDateString}.`
    );
  } else if (isStart && givenDateTime < meta.modeFirstDateTime) {
    throw new InvalidDatesException(
      `Not enough data available for this mode. First available date for mode ${
        index + 1
      } is ${meta.modeFirstDateString}.`
    );
  } else if (isStart && givenDateTime > meta.secondToLastDateTime) {
    throw new InvalidDatesException(
      `Given starting date ${givenDateString} not available in data. Last available starting date is ${meta.secondToLastDateString}.`
    );
  } else if (isStart && givenDateTime > meta.lastDateTime) {
    throw new InvalidDatesException(
      `Given date ${givenDateString} not available in data. Last available date is ${meta.lastDateTime}.`
    );
  } else if (!isStart && givenDateTime < startInput.getTime()) {
    throw new InvalidDatesException(
      `Ending date must be after the starting date.`
    );
  } else if (!isStart && givenDateTime === startInput.getTime()) {
    throw new InvalidDatesException(
      `Ending date can't be the same as starting date.`
    );
  } else if (!isStart && givenDateTime > meta.lastDateTime) {
    throw new InvalidDatesException(
      `Given date ${givenDateString} not available in data. Last available date is ${meta.lastDateString}.`
    );
  }
  return true;
};

const validateDates = (array, mode, dates, index) => {
  let meta = {
    firstDateTime: array[0].Date.getTime(),
    lastDateTime: array[array.length - 1].Date.getTime(),
    firstDateString: array[0].Date.toDateString(),
    lastDateString: array[array.length - 1].Date.toDateString(),
    lastIndex: array.length - 1,
    modeFirstDateTime: array[mode].Date.getTime(),
    modeFirstDateString: array[mode].Date.toDateString(),
  };
  if (!dates.custom) {
    dates.base.first = array[mode].Date;
    dates.base.last = array[array.length - 1].Date;
    dates.base.firstIndex = mode;
    dates.base.lastIndex = array.length - 1;
  } else if (dates.custom) {
    meta.givenFirstDateTime = dates.base.first.getTime();
    meta.givenLastDateTime = dates.base.last.getTime();
    meta.givenFirstDateString = dates.base.first.toDateString();
    meta.givenLastDateString = dates.base.last.toDateString();
    dates = checkCustomDates(array, mode, dates, meta);
  }
  return dates;
};

export {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
  entriesByDate,
  formatDataArray,
  isValidDate,
  validateDates,
};
