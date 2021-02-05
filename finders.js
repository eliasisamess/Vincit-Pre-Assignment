import {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
  formatStockMoney,
} from "./helpers.js";

// These functions are the core features to analyze stock market data and find entries by date range

// Calculates simple moving average for day N using the average value of closing prices between days N-1 to N-5.
// Calculates how many percentages (%) is the difference between the opening price of the day and the calculated SMA 5 price of the day.
// Logs list of dates and price change percentages. The list is ordered by price change percentages.
const bestSMA5 = (array) => {
  // console.log("Finding best sma5");
  let listOfResults = [];
  let startingIndex = 5;
  for (let i = startingIndex; i < array.length; i++) {
    let current;
    // console.log(
    //   `Today is ${array[i].Date.toDateString()} and opening price is ${
    //     array[i].Open
    //   }`
    // );
    let tempArray = [];
    for (let j = 5; j > 0; j--) {
      tempArray.push(array[i - j].Open);
      // console.log(
      //   `Pushed ${array[i - j].Date.toDateString()} (${
      //     array[i - j].Open
      //   }) to tempArray`
      // );
    }
    current = countSimpleMovingAverage(tempArray);
    // console.log(
    //   `Day is ${array[i].Date.toDateString()} open is ${
    //     array[i].Open
    //   } and SMA5 is ${current}`
    // );
    listOfResults.push({
      Date: array[i].Date,
      Open: array[i].Open,
      Sma5: current,
      Diff: countPercentageDifference(array[i].Open, current),
    });
  }
  // console.log("Here is a list of results:");
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
  // console.log(
  //   `done searcging ${array[0].Date.toDateString()} - ${array[
  //     array.length - 1
  //   ].Date.toDateString()}`
  // );
};

const longestTrends = (array, dates) => {
  let trends = {
    firstLength: 0,
    firstStartingDay: {},
    firstEndingDay: {},
    others: [],
  };
  let trendCounter = 0;
  for (let i = 1; i < array.length; i++) {
    if (dates.first.getTime() <= array[i].Date.getTime()) {
      let closeToday = array[i].Close;
      let closeYesterday = array[i - 1].Close;
      if (closeToday > closeYesterday) {
        console.log(
          `today is ${array[i].Date.toDateString()} close ${
            array[i].Close
          } vs ${array[i - 1].Close} (${array[i - 1].Date.toDateString()})`
        );
        if (trendCounter === 0) {
          console.log(
            `New trend has started on ${array[i - 1].Date.toDateString()}`
          );
        }
        trendCounter++;
        console.log(`trendCounter is ${trendCounter}`);
      } else if (closeToday <= closeYesterday) {
        console.log("closing today is lower or similar");
        // If the ended trend was longer than current longest, we set a new first
        // and clear the others (since they've been shorter, if set already)
        if (trends.firstLength < trendCounter) {
          trends.firstLength = trendCounter;
          console.log(`First longest trend set to ${trends.firstLength}.`);
          trends.firstStartingDay = array[i - trendCounter].Date;
          trends.firstEndingDay = array[i - 1].Date;
          console.log(
            `First longest trend range set to ${trends.firstStartingDay} - ${trends.firstEndingDay}.`
          );
          trends.others = [];
          console.log("Cleared the others because new longest trend was set.");
          // If the ended trend was as long as the first longest, we add current
          // trend to others[] array.
        } else if (
          trends.firstLength === trendCounter &&
          trends.firstLength > 0
        ) {
          trends.others.push({
            trendLength: trendCounter,
            startingDay: array[i - trendCounter].Date,
            endingDay: array[i - 1].Date,
          });
          console.log(
            `Found trend as long (${trendCounter}) as the current longest (${longestTrends.firstLength}) and added it to others[]`
          );
        }
      }
      // If current trend ended, clear it before next round
      trendCounter = 0;
    }
  }
};

////////
////////
///////
const oldlongestTrends = (array, dates) => {
  // This variable will include the (first) longest trend from given time range
  // and others that are the same length
  let longestTrends = {
    firstLength: 1,
    firstStartingDay: {},
    firstEndingDay: {},
    others: [],
  };

  let trendCounter = 0;

  // We go through the array using for loop and search for trends
  // Start from index 1, because findEntriesByDate function will
  // search for either 1 or 5 entries before the given time range
  // starts, according to if one is looking for either upward
  // trends (this function) or best price to SMA 5 (findBestSMA5 function)
  for (let i = 1; i < array.length; i++) {
    if (array[i].Date.getTime() <= dates.last.getTime()) {
      //   console.log(`${array[i].Date.getTime()} <= ${dates.last.getTime()}`);

      console.log("index round is " + i);
      // Declare closing prices of this round (i)
      let closingToday = array[i].Close;
      let closingYesterday = array[i - 1].Close;

      // START OF TEST LOGS
      console.log(
        `Today is ${array[
          i
        ].Date.toDateString()} and closing is ${closingToday} vs ${closingYesterday} (${array[
          i - 1
        ].Date.toDateString()})`
      );
      // END OF TEST LOGS

      // If todays price is higher than yesterday, we start a new trend
      if (closingToday > closingYesterday) {
        console.log(`Closing today is higher than yesterdays`);

        if (trendCounter === 0) {
          console.log(
            `New trend has started on ${array[i - 1].Date.toDateString()}`
          );
        }
        ++trendCounter;
        console.log(`Current trend length is now ${trendCounter} days.`);

        // If todays price is lower than yesterday, we end the trend
      } else if (closingToday < closingYesterday) {
        console.log("closing today is lower");
        // If the ended trend was longer than current longest, we set a new first
        // and clear the others (since they've been shorter, if set already)
        if (longestTrends.firstLength < trendCounter) {
          longestTrends.firstLength = trendCounter;
          console.log(
            `First longest trend set to ${longestTrends.firstLength}.`
          );
          longestTrends.firstStartingDay = array[i - trendCounter].Date;
          longestTrends.firstEndingDay = array[i - 1].Date;
          console.log(
            `First longest trend range set to ${longestTrends.firstStartingDay} - ${longestTrends.firstEndingDay}.`
          );
          longestTrends.others = [];
          console.log("Cleared the others because new longest trend was set.");

          // If the ended trend was as long as the first longest, we add current
          // trend to others[] array.
        } else if (
          longestTrends.firstLength === trendCounter &&
          longestTrends.firstLength > 0
        ) {
          longestTrends.others.push({
            trendLength: trendCounter,
            startingDay: array[i - trendCounter].Date,
            endingDay: array[i - 1].Date,
          });
          console.log(
            `Found trend as long (${trendCounter}) as the current longest (${longestTrends.firstLength}) and added it to others[]`
          );
        }
        // If current trend ended, clear it before next round
        trendCounter = 0;
      }
    }
  }

  ///7
  ////
  ////
  console.log(
    `Finished looking for trends. During given timerange the longest trend was ${longestTrends.firstLength} days and there were ${longestTrends.others.length} other similar trends:`
  );
  console.log(
    `${longestTrends.firstStartingDay.toDateString()} - ${longestTrends.firstEndingDay.toDateString()}`
  );
  longestTrends.others.forEach((item) =>
    console.log(
      `${item.startingDay.toDateString()} - ${item.endingDay.toDateString()}`
    )
  );
};
//////
//////
////////

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
      `DATE: ${item.Date.toDateString()} VOLUME: ${item.Volume} CHANGE: ${
        item.Change
      }`
    )
  );
  // return newArray;
};

// Returns all entries from object between given date range and also dates before the start day, according to mode (how many past entries)
// Throws error if time range doesn't match with given data.
// Read csv file to json
const entriesByDate = (array, mode, dates) => {
  console.log("looking for entriesByDate");
  let chosenEntries = [];
  let temp = [];
  // Format each entry to date objects, integers and floats
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

  let addExtras = false;
  if (mode != 0) {
    addExtras = true;
    let firstIndex = temp.findIndex(
      (a) => a.Date.getTime() === dates.first.getTime()
    );
    console.log(firstIndex);
    dates.first = temp[firstIndex].Date;
  }
  console.log("!!!! dates customise is " + dates.custom);
  console.log("!!!! dates first is " + dates.first.toDateString());
  console.log("!!!! dates last is " + dates.last.toDateString());

  console.log(addExtras + " add texteareh and mode " + mode);
  for (let i = mode; i < temp.length; i++) {
    if (addExtras && temp[i].Date.getTime() === dates.first.getTime()) {
      for (let j = mode; j >= 0; j--) {
        chosenEntries.push(temp[i - j]);
        console.log(`pushed ${temp[i - j].Date}`);
        console.log(
          `add extras so added pre's and first ${temp[
            i - j
          ].Date.toDateString()}`
        );
      }
    } else if (!addExtras && temp[i].Date.getTime() === dates.first.getTime()) {
      chosenEntries.push(temp[i]);
      console.log(
        `dont add extras so pushed first ${temp[i].Date.toDateString()}`
      );
    } else if (
      temp[i].Date.getTime() > dates.first.getTime() &&
      temp[i].Date.getTime() < dates.last.getTime()
    ) {
      chosenEntries.push(temp[i]);
      console.log(`added days between ${temp[i].Date.toDateString()}`);
    } else if (temp[i].Date.getTime() === dates.last.getTime()) {
      chosenEntries.push(temp[i]);
      console.log(`added last ${temp[i].Date.toDateString()}`);
      // If mode is 1 (searching for trends), lets add one more
      // if (mode === 1) {
      //   chosenEntries.push(obj[i + 1]);
      //   console.log(`added extra ${obj[i + 1].Date.toDateString()}`);
      // }
    }
  }
  return chosenEntries;
};

export { bestSMA5, longestTrends, volumesAndPriceChanges, entriesByDate };
