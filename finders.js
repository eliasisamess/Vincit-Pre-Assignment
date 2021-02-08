import {
  countDifference,
  countPercentageDifference,
  countSimpleMovingAverage,
} from "./helpers.js";

// UNUSED STUFF HERE! dates ei oo käytössä ja tää on muutenki vähän turha funkkari tällä hetkellä, ehkä, vois olla suoraan tuol indexin puolellaki
const analyzeStockData = (selected, mode, dates) => {
  if (mode == 1) {
    longestTrends(selected, dates);
  } else if (mode == 0) {
    volumesAndPriceChanges(selected, dates);
  } else if (mode == 5) {
    bestSMA5(selected, dates);
  }
};

// BEST SMA5
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
  //   `done searching ${array[0].Date.toDateString()} - ${array[
  //     array.length - 1
  //   ].Date.toDateString()}`
  // );
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
    // console.log(`Round ${i} ${today.Date.toDateString()}`);
    // console.log(`TrendCounter is now ${trendCounter}`);

    if (today.Close > yesterday.Close) {
      // console.log(
      //   `+++Todays (${today.Date.toDateString()}) price ${today.Close} vs. ${
      //     yesterday.Close
      //   } (${yesterday.Date.toDateString()})`
      // );
      // if (trendCounter === 0) {
      //   console.log(`NEW TREND HAS STARTED ON ${today.Date.toDateString()}`);
      // }
      trendCounter++;
      // console.log(`TrendCounter is now ${trendCounter}`);
    } else if (today.Close <= yesterday.Close) {
      // console.log(
      //   `---Todays (${today.Date.toDateString()}) price ${today.Close} vs ${
      //     yesterday.Close
      //   } (${yesterday.Date.toDateString()})`
      // );

      // If current trend ended, clear it before next round
      trendCounter = 0;
    }
    // If the ended trend was longer than current longest, we set a new first
    // and clear the others (since they've been shorter, if set already)
    if (trends.firstLength < trendCounter) {
      trends.firstLength = trendCounter;
      // console.log(`WOOHOOO!New longest trend set to ${trends.firstLength}.`);
      trends.firstStartingDay = array[i - trendCounter].Date;
      trends.firstEndingDay = today.Date;
      // console.log(
      //   `FIRST LONGEST TREND range set to ${trends.firstStartingDay.toDateString()} - ${trends.firstEndingDay.toDateString()}.`
      // );
      trends.others = [];
      // console.log("Cleared the others because new longest trend was set.");
      // If the ended trend was as long as the first longest, we add current
      // trend to others[] array.
    } else if (trends.firstLength === trendCounter) {
      trends.others.push({
        trendLength: trendCounter,
        startingDay: array[i - trendCounter].Date,
        endingDay: today.Date,
      });
      // console.log(
      //   `Found trend as long (${trendCounter}) as the current longest (${trends.firstLength}) and added it to others[]`
      // );
    }
  }
  // console.log("Finished analyzing trends.");
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
  // return newArray;
};

export { analyzeStockData, bestSMA5, longestTrends, volumesAndPriceChanges };
