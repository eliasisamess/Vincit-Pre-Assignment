// Count and format functions are returning values as toFixed(5), because Nasdaq
// recommends to use 5 decimals in most scenarios:
// https://www.nasdaq.com/docs/rec-indexation-coefficient.pdf

function InvalidDatesException(message) {
  this.message = message;
  this.name = "ERROR: Date validation failed.";
}

const checkCustomDates = (array, mode, dates, meta) => {
  // console.log("checkin custom dates HÖLÖ");
  // console.log(dates);
  // let foundExact = null;
  let foundFirstIndex;
  let foundFirstDateTime;
  let foundLastIndex;
  // let foundFirstExactIndex;
  // let foundFirstNextIndex;
  // let foundFirstExactDateTime;
  // let foundFirstNextDateTime;
  // let enoughDataBetween = false;
  // console.log("gonna search fisrt noew");
  for (let i = 0; i < array.length; i++) {
    if (array[i].Date.getTime() === meta.givenFirstDateTime) {
      console.log(
        `EXACT object found at ${i} (${array[i].Date.toDateString()})`
      );
      foundFirstIndex = i;
      console.log(
        `Exact index set to ${foundFirstIndex} (${array[
          foundFirstIndex
        ].Date.toDateString()})`
      );
      foundFirstDateTime = array[i].Date.getTime();
      break;
    } else if (array[i].Date.getTime() > meta.givenFirstDateTime) {
      console.log(
        `NEXT object found at ${i} (${array[i].Date.toDateString()})`
      );
      foundFirstIndex = i;
      console.log("Next index set to " + i);
      console.log(
        "That index includes this date: " +
          array[foundFirstIndex].Date.toDateString()
      );
      foundFirstDateTime = array[i].Date.getTime();
      break;
    }
  }

  for (let i = 0; i < array.length; i++) {
    if (array[i].Date.getTime() === meta.givenLastDateTime) {
      console.log("Exact last date found at index " + i);
      console.log("That includes " + array[i].Date.toDateString());
      foundLastIndex = i;
      console.log("FoundL ast index set to " + foundLastIndex);
      break;
    } else if (array[i].Date.getTime() > meta.givenLastDateTime) {
      console.log("Next last date found at index " + i);
      console.log("That includes " + array[i].Date.toDateString());
      foundLastIndex = i - 1;
      console.log("found last index set to " + foundLastIndex);
      console.log("it includes " + array[foundLastIndex].Date.toDateString());
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
    console.log(
      "enough data found between " +
        meta.givenFirstDateString +
        " and " +
        meta.givenLastDateString
    );
    dates.base.firstIndex = foundFirstIndex;
    dates.base.lastIndex = foundLastIndex;
    // console.log(
    //   `foundFirstIndex ${foundFirstIndex} foundLastIndex) ${foundLastIndex}`
    // );
  }
  console.log(
    "quadruple check round: " +
      array[dates.base.firstIndex].Date.toDateString() +
      " - " +
      array[dates.base.lastIndex].Date.toDateString()
  );
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
  // console.log("validation successful, now searching entriesByDate");
  let chosenEntries = [];
  // let addExtras = mode != 0 ? true : false;
  for (let i = dates.base.firstIndex; i <= dates.base.lastIndex; i++) {
    // console.log(`round ${i}`);
    if (i === dates.base.firstIndex) {
      for (let j = mode; j >= 0; j--) {
        chosenEntries.push(array[i - j]);
        console.log(`Pushing firsts ${array[i - j].Date.toDateString()}`);
      }
    } else {
      chosenEntries.push(array[i]);
      console.log(`pushed others ${array[i].Date.toDateString()}`);
      // console.log(
      //   `dont add extras so pushed first ${array[i].Date.toDateString()}`
      // );
      // } else if (
      //   array[i].Date.getTime() > dates.base.first.getTime() &&
      //   array[i].Date.getTime() < dates.base.last.getTime()
      // ) {
      //   chosenEntries.push(array[i]);
      //   // console.log(`added days between ${array[i].Date.toDateString()}`);
      // } else if (array[i].Date.getTime() === dates.base.last.getTime()) {
      //   chosenEntries.push(array[i]);
      //   // console.log(`added last ${array[i].Date.toDateString()}`);
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
  // console.log("validating dates");
  // console.log(`mode is ${mode} and index ${index}`);
  // console.log("dates inside validateDates:");
  // console.log(dates);
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
  // console.log("this is meta");
  // console.log(meta);
  if (!dates.custom) {
    dates.base.first = array[mode].Date;
    dates.base.last = array[array.length - 1].Date;
    dates.base.firstIndex = mode;
    dates.base.lastIndex = array.length - 1;
    console.log(
      "automatically adjusted starting day to " +
        dates.base.first.toDateString() +
        " and ending day to " +
        dates.base.last.toDateString() +
        " and indexes to " +
        dates.base.firstIndex +
        dates.base.lastIndex
    );
  } else if (dates.custom) {
    // console.log("custom dates found so lets validate here");
    // console.log("again dates:");
    // console.log(dates);
    meta.givenFirstDateTime = dates.base.first.getTime();
    meta.givenLastDateTime = dates.base.last.getTime();
    meta.givenFirstDateString = dates.base.first.toDateString();
    meta.givenLastDateString = dates.base.last.toDateString();

    // if (meta.givenFirstDateTime < meta.firstDateTime) {
    //   throw new InvalidDatesException(
    //     `Starting day ${givenFirstDateString} not available in data. First available date is ${meta.firstDateString} `
    //   );
    // } else if (meta.givenLastDateTime > meta.lastDateTime) {
    //   throw new InvalidDatesException(
    //     `Ending day ${meta.givenLastDateString} not available in data. Last available date is ${meta.lastDateString} `
    //   );
    // } else if (meta.givenFirstDateTime < meta.modeFirstDateTime) {
    //   throw new InvalidDatesException(
    //     `Starting day ${
    //       meta.givenFirstDateString
    //     } not available in data for this mode. First available date for mode ${
    //       index + 1
    //     } is ${meta.modeFirstDateString} `
    //   );
    //   // } else if (
    //   //   givenFirstDateTime != meta.modeFirstDateTime ||
    //   //   givenLastDateTime != meta.lastDateTime
    //   // ) {
    // }
    dates = checkCustomDates(array, mode, dates, meta);
  }
  // console.log("now we have validated and it looks like this");
  // console.log(dates);
  return dates;
};

export {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
  entriesByDate,
  formatDataArray,
  validateDates,
  isValidDate,
  checkCustomDates,
};
