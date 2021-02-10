// Count and format functions are returning values as toFixed(5),
// because Nasdaq recommends to use 5 decimals in most scenarios:
// https://www.nasdaq.com/docs/rec-indexation-coefficient.pdf

// If date validations fail, this error will be thrown. No other errors
// should be possible to be made by the user. Node packages will throw
// their own errors though.
function InvalidDatesException(message) {
  this.message = message
  this.name = 'Error: Date validation failed.'
}

// This function checks and finds the proper indices within the data.
const checkCustomDates = (array, dates, meta) => {
  // Look for the given starting date or the first possible after given date.
  let foundFirstIndex = array.findIndex(
    (item) =>
      item.Date.getTime() === meta.givenFirstDateTime ||
      item.Date.getTime() > meta.givenFirstDateTime
  )
  // Look for the given ending date within the array.
  let foundLastIndex = array.findIndex(
    (item) =>
      // When a date is found, add it's index to foundLastIndex.
      item.Date.getTime() === meta.givenLastDateTime ||
      item.Date.getTime() > meta.givenLastDateTime
  )
  // If the found index date is after the given last date, pick one index before.
  if (array[foundLastIndex].Date.getTime() > meta.givenLastDateTime) {
    foundLastIndex--
  }
  // If found starting date index is the same or after the ending date we
  // throw error because there won't be enough data to process later.
  // For example, if user give a date range of Sat Jan 9, 2021 - Sun Jan 10, 2021,
  // an error will be thrown because the stock markets have not been open on
  // weekend and therefore there won't any data to process between these dates.
  if (
    array[foundFirstIndex].Date.getTime() >=
    array[foundLastIndex].Date.getTime()
  ) {
    throw new InvalidDatesException(
      'Not enough data available between given dates.'
    )
  } else {
    // If everything is ok, we add the found indices to dates -object.
    // Now the dates -object will give the correct information to
    // the next function in control flow.
    dates.base.firstIndex = foundFirstIndex
    dates.base.lastIndex = foundLastIndex
  }
  return dates
}

// Count difference between stock price change within a day.
const countDifference = (a, b) => {
  let result = a - b
  return result.toFixed(5)
}

// Count percentage difference between opening price and SMA5 price of a day.
const countPercentageDifference = (a, b) => {
  let result = (a / b) * 100 - 100
  return result.toFixed(5)
}

// Count simple moving average of a day N from an array of closing prices from days N-1 to N-5.
const countSimpleMovingAverage = (array) => {
  let sum = 0
  array.forEach((item) => {
    sum = parseFloat(sum) + parseFloat(item)
  })
  let result = sum / array.length
  return result.toFixed(5)
}

// Returns all entries from object between given date range and also dates
// before the starting day, if needed, according to mode setting.
const entriesByDate = (array, mode, dates) => {
  // Use Array.prototype.filter to find matching dates
  return array.filter((item, index) => {
    if (
      // Dates -object has been validated before and can be easily used here.
      // If variable mode is 1 or 5, we will add 1 or 5 entries from the data
      // before the given starting day to get the result we want. When mode
      // is 0, the first index to be added will be the firstIndex.
      index >= dates.base.firstIndex - mode &&
      index <= dates.base.lastIndex
    ) {
      return item
    }
  })
}

// Iterate through the given stock data and convert it's objects, keys
// and values to ease later use and processing of the data.
const formatDataArray = (array) =>
  array
    .map((item) => ({
      Date: new Date(item.Date),
      Close: formatStockMoney(item['Close/Last']),
      Volume: parseInt(item.Volume),
      Open: formatStockMoney(item.Open),
      High: formatStockMoney(item.High),
      Low: formatStockMoney(item.Low),
    }))
    .sort((a, b) => {
      return a.Date - b.Date
    })

// Format Nasdaq csv currency information to float variables.
const formatStockMoney = (string) => {
  let formatted = string.replace('$', '')
  formatted = parseFloat(formatted)
  return formatted.toFixed(5)
}

// Validate user given date input within the readline-sync console UI.
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
  }
  // Create date object from the string input.
  let validateInput = new Date(input)
  // If the date object is not valid, this will throw error
  if (Object.prototype.toString.call(validateInput) === '[object Date]') {
    if (isNaN(validateInput.getTime())) {
      throw new InvalidDatesException(
        `"${input}" is not a valid ${
          isStart ? 'starting' : 'ending'
        } date, please try again.`
      )
    }
  } else {
    throw new InvalidDatesException(
      'Not a proper date object, please try again and follow the instructions.'
    )
  }
  // Declare some variables to ease reading of this code.
  let givenDateTime = validateInput.getTime()
  let givenDateString = validateInput.toDateString()
  // Throw possible validation errors here.
  if (isStart && givenDateTime < meta.firstDateTime) {
    throw new InvalidDatesException(
      `Given date ${givenDateString} not available in data. First available date for mode ${
        index + 1
      } is ${meta.modeFirstDateString}.`
    )
  } else if (isStart && givenDateTime < meta.modeFirstDateTime) {
    throw new InvalidDatesException(
      `Not enough data available for this mode. First available date for mode ${
        index + 1
      } is ${meta.modeFirstDateString}.`
    )
  } else if (isStart && givenDateTime > meta.secondToLastDateTime) {
    throw new InvalidDatesException(
      `Given starting date ${givenDateString} not available in data. Last available starting date is ${meta.secondToLastDateString}.`
    )
  } else if (isStart && givenDateTime > meta.lastDateTime) {
    throw new InvalidDatesException(
      `Given date ${givenDateString} not available in data. Last available date is ${meta.lastDateTime}.`
    )
  } else if (!isStart && givenDateTime < startInput.getTime()) {
    throw new InvalidDatesException(
      'Ending date must be after the starting date.'
    )
  } else if (!isStart && givenDateTime === startInput.getTime()) {
    throw new InvalidDatesException(
      `Ending date can't be the same as starting date.`
    )
  } else if (!isStart && givenDateTime > meta.lastDateTime) {
    throw new InvalidDatesException(
      `Given date ${givenDateString} not available in data. Last available date is ${meta.lastDateString}.`
    )
  }
  // If no errors, return true and continue.
  return true
}

// After validating the user given inputs, we still need to make sure they
// match the data in array.
const validateDates = (array, mode, dates) => {
  let meta = {
    firstDateTime: array[0].Date.getTime(),
    lastDateTime: array[array.length - 1].Date.getTime(),
    firstDateString: array[0].Date.toDateString(),
    lastDateString: array[array.length - 1].Date.toDateString(),
    lastIndex: array.length - 1,
    modeFirstDateTime: array[mode].Date.getTime(),
    modeFirstDateString: array[mode].Date.toDateString(),
  }
  if (!dates.custom) {
    // If no custom dates were given, choose proper indices for next steps here.
    dates.base.first = array[mode].Date
    dates.base.last = array[array.length - 1].Date
    dates.base.firstIndex = mode
    dates.base.lastIndex = array.length - 1
  } else if (dates.custom) {
    // Else if custom dates were given, set variables and find proper indices
    // or throw errors in checkCustomDates if no data between given dates.
    meta.givenFirstDateTime = dates.base.first.getTime()
    meta.givenLastDateTime = dates.base.last.getTime()
    meta.givenFirstDateString = dates.base.first.toDateString()
    meta.givenLastDateString = dates.base.last.toDateString()
    dates = checkCustomDates(array, dates, meta)
  }
  return dates
}

export {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
  entriesByDate,
  formatDataArray,
  isValidDate,
  validateDates,
}
