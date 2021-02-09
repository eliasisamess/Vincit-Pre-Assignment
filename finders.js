// IMPORTS
import {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
} from "./helpers.js";

// This file includes the main functions for analyzing the stock data.

// Calculates simple moving average for day N using the average value of
// closing prices between days N-1 to N-5. Also calculates how many
// percentages (%) is the difference between the opening price of the day
// and the calculated SMA 5 price of the day. Prints out list of dates and price
// change percentages. The list is ordered by price change percentages.
const bestSMA5 = (array) => {
  let listOfResults = [];
  let startingIndex = 5;
  for (let i = startingIndex; i < array.length; i++) {
    let current;
    let tempArray = [];
    for (let j = 5; j > 0; j--) {
      tempArray.push(array[i - j].Open);
    }
    current = countSimpleMovingAverage(tempArray);
    listOfResults.push({
      Date: array[i].Date,
      Open: array[i].Open,
      Sma5: current,
      Diff: countPercentageDifference(array[i].Open, current),
    });
  }
  listOfResults.sort((a, b) => {
    return b.Diff - a.Diff;
  });
  console.log("Printing task results:");
  listOfResults.forEach((item) =>
    console.log(
      `DATE: ${item.Date.toDateString()} OPEN: $${item.Open} SMA5: $${
        item.Sma5
      } DIFF: ${item.Diff > 0 ? "+" + item.Diff : item.Diff}%`
    )
  );
};

// Finds longest bullish (upwards) trends within the stock data.
// Definition of an upward trend is: “Closing price of day N is higher than
// the closing price of day N-1”. Outputs the maximum amounts of days the stock
// price was increasing in a row, the date range of the longest trend and also
// the date ranges of other similar trends within the data.
const longestTrends = (array) => {
  // This trends -object will include info from the current longest trends while
  // iterating over the data; the first trend and other similars found after that.
  let trends = {
    firstLength: 0,
    firstStartingDay: {},
    firstEndingDay: {},
    others: [],
  };
  // This variable will be incremented every time the stock price was
  // higher on current day than the day before, while iterating.
  let trendCounter = 0;

  // Start the iteration of the given array.
  for (let i = 1; i < array.length; i++) {
    // Current day during this round ofiteration.
    let today = array[i];
    // Yesterday during this round of iteration.
    let yesterday = array[i - 1];
    if (today.Close > yesterday.Close) {
      // If today's price is higher than yesterday's, increment trendCounter.
      trendCounter++;
    } else if (today.Close <= yesterday.Close) {
      // If current trend ended, clear trendCounter before next round.
      trendCounter = 0;
    }
    if (trends.firstLength < trendCounter) {
      // If the ended trend was longer than the current longest, we set a new
      // first longest trend and clear the others, since they're shorter than
      // the newfound longest trend.
      trends.firstLength = trendCounter;
      trends.firstStartingDay = array[i - trendCounter].Date;
      trends.firstEndingDay = today.Date;
      trends.others = [];
    } else if (trends.firstLength === trendCounter) {
      // If the ended trend was as long as the first longest, we push current
      // trend to others[] array.
      trends.others.push({
        trendLength: trendCounter,
        startingDay: array[i - trendCounter].Date,
        endingDay: today.Date,
      });
    }
  }
  // Output results of the search for longest trends.
  console.log("Printing task results:");
  console.log(
    `During given timerange the longest upwards trend was ${
      trends.firstLength + 1
    } days and there were ${trends.others.length} other similar trends:`
  );
  console.log(
    `${trends.firstStartingDay.toDateString()} - ${trends.firstEndingDay.toDateString()}`
  );
  trends.others.forEach((item) =>
    console.log(
      `${item.startingDay.toDateString()} - ${item.endingDay.toDateString()}`
    )
  );
};

// Find volumes and price changes within the given date range and outputs
// them sorted first by volume, then by the most significant stock price
// change within a day.
const volumesAndPriceChanges = (array) => {
  let listOfResults = [];
  array.forEach((item) =>
    listOfResults.push({
      Date: item.Date,
      Volume: item.Volume,
      Change: countDifference(item.High, item.Low),
    })
  );
  listOfResults = listOfResults.sort((a, b) => {
    return b.Volume - a.Volume || b.Change - a.Change;
  });
  // Output results.
  console.log("Printing task results:");
  listOfResults.forEach((item) =>
    console.log(
      `DATE: ${item.Date.toDateString()} VOLUME: ${item.Volume} CHANGE: $${
        item.Change
      }`
    )
  );
};

export { bestSMA5, longestTrends, volumesAndPriceChanges };
