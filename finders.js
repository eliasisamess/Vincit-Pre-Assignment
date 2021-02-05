import {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
  formatStockMoney,
  checkDates,
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
  const firstDay = array[1].Date.getTime();
  const lastDay = array[array.length - 1].Date.getTime();

  for (let i = 1; i < array.length; i++) {
    let closeToday = array[i].Close;
    let closeYesterday = array[i - 1].Close;
    let today = array[i].Date.getTime();
    let yesterday = array[i - 1].Date.getTime();
    // console.log(`Round ${i} ${array[i].Date.toDateString()}`);

    if (today != lastDay && closeToday > closeYesterday) {
      // console.log(
      //   `Today ${array[
      //     i
      //   ].Date.toDateString()} close ${closeToday} vs ${closeYesterday} (${array[
      //     i - 1
      //   ].Date.toDateString()})`
      // );
      if (trendCounter === 0) {
        console.log(`New trend has started on ${array[i].Date.toDateString()}`);
      }
      trendCounter++;
      console.log(`trendCounter is ${trendCounter}`);
    } else if (today != lastDay && closeToday <= closeYesterday) {
      if (trendCounter < 0) {
        console.log("trend ended at " + trendCounter + " days ");
      }
      console.log("closing today is lower or same");
      // If the ended trend was longer than current longest, we set a new first
      // and clear the others (since they've been shorter, if set already)
      if (trends.firstLength < trendCounter && trends.firstLength > 0) {
        trends.firstLength = trendCounter;
        console.log(`New longest trend set to ${trends.firstLength}.`);
        trends.firstStartingDay = array[i - trendCounter].Date;
        trends.firstEndingDay = array[i - 1].Date;
        console.log(
          `First longest trend range set to ${trends.firstStartingDay} - ${trends.firstEndingDay}.`
        );
        trends.others = [];
        console.log("Cleared the others because new longest trend was set.");
        // If the ended trend was as long as the first longest, we add current
        // trend to others[] array.
      } else if (trends.firstLength === trendCounter && trendCounter > 0) {
        trends.others.push({
          trendLength: trendCounter,
          startingDay: array[i - trendCounter].Date,
          endingDay: array[i - 1].Date,
        });
        console.log(
          `Found trend as long (${trendCounter}) as the current longest (${trends.firstLength}) and added it to others[]`
        );
      }
      // If current trend ended, clear it before next round
      trendCounter = 0;
      // If last round and still rising
    } else if (today === lastDay && closeToday > closeYesterday) {
      console.log(
        "today is lasta day and pistietä perklele " +
          array[i].Date.toDateString()
      );
      trendCounter++;
      console.log(`trendcounter ${trendCounter}`);
      if (trends.firstLength < trendCounter) {
        trends.firstLength = trendCounter;
        console.log(`First longest trend set to ${trends.firstLength}.`);
        trends.firstStartingDay = array[i - trendCounter].Date;
        trends.firstEndingDay = array[i].Date;
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
          endingDay: array[i].Date,
        });
        console.log(
          `Found trend as long (${trendCounter}) as the current longest (${trends.firstLength}) and added it to others[]`
        );
      }
    }
  }

  console.log("finished looking for trends");
  if (trends.firstLength === 0) {
    console.log("during given timerange, there were no upwards trends");
  } else if (trends.firstLength === 1) {
    console.log(
      `During given timerange the longest trend was ${
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
  } else {
    console.log(
      `During given timerange the longest trend was ${
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
    `Finished looking for trends. During given timerange the longest trend was ${
      longestTrends.firstLength + 1
    } days and there were ${longestTrends.others.length} other similar trends:`
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
  console.log(
    `user ${dates.first.toDateString()} - ${dates.last.toDateString()}`
  );
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
  let addExtras = mode != 0 ? true : false;
  let days = checkDates(temp, mode, dates);
  let firstDay = days[0];
  let lastDay = temp[days[1]].Date;
  console.log(
    `!!! machine set firstDayindex ${temp[
      firstDay
    ].Date.toDateString()}, last ${lastDay.toDateString()}`
  );
  console.log("!!!! dates customise is " + dates.custom);
  if (dates.custom) {
    console.log("!!!! custom dates first is " + dates.first.toDateString());
    console.log("!!!! custome dates last is " + dates.last.toDateString());
  }
  if (addExtras) {
    console.log("adding extras, mode is " + mode);
  }
  for (let i = firstDay; i < temp.length; i++) {
    console.log(`round ${i}`);
    if (addExtras && i === firstDay) {
      for (let j = mode; j >= 0; j--) {
        chosenEntries.push(temp[i - j]);
        console.log(`pushed ${temp[i - j].Date.toDateString()}`);
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
    }
  }
  return chosenEntries;
};

export { bestSMA5, longestTrends, volumesAndPriceChanges, entriesByDate };
