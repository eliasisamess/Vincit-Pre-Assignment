import {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
} from "./helpers.js";

// BEST SMA5
// Calculates simple moving average for day N using the average value of closing prices between days N-1 to N-5.
// Calculates how many percentages (%) is the difference between the opening price of the day and the calculated SMA 5 price of the day.
// Logs list of dates and price change percentages. The list is ordered by price change percentages.
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
  listOfResults.forEach((item) =>
    console.log(
      `DATE: ${item.Date.toDateString()} OPEN: $${item.Open} SMA5: $${
        item.Sma5
      } DIFF: ${item.Diff > 0 ? "+" + item.Diff : item.Diff}%`
    )
  );
};

// LONGEST TRENDS
// Finds longest trends
const longestTrends = (array) => {
  let trends = {
    firstLength: 0,
    firstStartingDay: {},
    firstEndingDay: {},
    others: [],
  };
  let trendCounter = 0;
  for (let i = 1; i < array.length; i++) {
    let today = array[i];
    let yesterday = array[i - 1];
    if (today.Close > yesterday.Close) {
      trendCounter++;
    } else if (today.Close <= yesterday.Close) {
      // If current trend ended, clear it before next round
      trendCounter = 0;
    }
    // If the ended trend was longer than current longest, we set a new first
    // and clear the others (since they've been shorter, if set already)
    if (trends.firstLength < trendCounter) {
      trends.firstLength = trendCounter;
      trends.firstStartingDay = array[i - trendCounter].Date;
      trends.firstEndingDay = today.Date;
      trends.others = [];
      // If the ended trend was as long as the first longest, we push current
      // trend to others[] array.
    } else if (trends.firstLength === trendCounter) {
      trends.others.push({
        trendLength: trendCounter,
        startingDay: array[i - trendCounter].Date,
        endingDay: today.Date,
      });
    }
  }
  console.log(
    `During given timerange (${array[1].Date.toDateString()} - ${array[
      array.length - 1
    ].Date.toDateString()}) the longest upwards trend was ${
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

// VOLUMES AND PRICE CHANGES
// Finds volumes and price changes
const volumesAndPriceChanges = (array) => {
  let newArray = [];
  array.forEach((item) =>
    newArray.push({
      Date: item.Date,
      Volume: item.Volume,
      Change: countDifference(item.High, item.Low),
    })
  );
  newArray = newArray.sort((a, b) => {
    return b.Volume - a.Volume || b.Change - a.Change;
  });
  newArray.forEach((item) =>
    console.log(
      `DATE: ${item.Date.toDateString()} VOLUME: ${item.Volume} CHANGE: $${
        item.Change
      }`
    )
  );
};

export { bestSMA5, longestTrends, volumesAndPriceChanges };
