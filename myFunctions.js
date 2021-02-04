const csv = require("csvtojson");

const helpers = {
  formatStockMoney: (string) => {
    let formatted = string.replace("$", "");
    formatted = parseFloat(formatted);
    // console.log(`formatting stock money ${string} to ${formatted}`);
    return formatted.toFixed(5);
  },
  countDifference: (a, b) => {
    let result = a - b;
    return result.toFixed(5);
  },
  countPercentageDifference: (a, b) => {
    let result = (a / b) * 100 - 100;
    // console.log(
    //   `Counting percentage difference between ${a} and ${b} which is ${result}`
    // );
    return result.toFixed(5);
  },
  countSimpleMovingAverage: (array) => {
    // console.log(`Counting simple moving average now`);
    let sum = 0;
    array.forEach((item) => {
      sum = parseFloat(sum) + parseFloat(item);
      // console.log(`item is now ${item} and sum is ${sum}`);
    });
    let result = sum / array.length;
    return result.toFixed(5);
  },
  // printAll: (obj) => {
  //   console.log("printing all");
  //   obj.forEach((entry) =>
  //     console.log(
  //       `${entry.Date.toDateString()} ${entry["Close/Last"]} ${entry.Volume} ${
  //         entry.Open
  //       } ${entry.High} ${entry.Low} `
  //     )
  //   );
  // },
};

const finders = {
  async bestSMA5(array) {
    console.log("Finding best sma5");
    let listOfResults = [];
    let startingIndex = 5;
    for (let i = startingIndex; i < array.length; i++) {
      let current;
      console.log(
        `Today is ${array[i].Date.toDateString()} and opening price is ${
          array[i].Open
        }`
      );
      let tempArray = [];
      for (let j = 5; j > 0; j--) {
        tempArray.push(array[i - j].Open);
        console.log(
          `Pushed ${array[i - j].Date.toDateString()} (${
            array[i - j].Open
          }) to tempArray`
        );
      }
      current = helpers.countSimpleMovingAverage(tempArray);
      console.log(
        `Day is ${array[i].Date.toDateString()} open is ${
          array[i].Open
        } and SMA5 is ${current}`
      );
      listOfResults.push({
        Date: array[i].Date,
        Open: array[i].Open,
        Sma5: current,
        Diff: helpers.countPercentageDifference(array[i].Open, current),
      });
    }
    console.log("Here is a list of results:");
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
    console.log(
      `done searcging ${array[0].Date.toDateString()} - ${array[
        array.length - 1
      ].Date.toDateString()}`
    );
  },
  // Returns longest bullish (upwards) trends during given time range.
  async longestTrends(array) {
    // This variable will include the (first) longest trend from given time range
    // and others that are the same length
    let longestTrends = {
      firstLength: 1,
      firstStartingDay: {},
      firstEndingDay: {},
      others: [],
    };

    let trendCounter = 1;

    // We go through the array using for loop and search for trends
    // Start from index 1, because findEntriesByDate function will
    // search for either 1 or 5 entries before the given time range
    // starts, according to if one is looking for either upward
    // trends (this function) or best price to SMA 5 (findBestSMA5 function)
    for (let i = 1; i < array.length; i++) {
      console.log("index round is " + i);
      // Declare closing prices of this round (i)
      let closingToday = array[i]["Close/Last"];
      let closingYesterday = array[i - 1]["Close/Last"];

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

        if (trendCounter === 1) {
          console.log(
            `New trend has started on ${array[i - 1].Date.toDateString()}`
          );
        }
        ++trendCounter;
        console.log(`Current trend length is now ${trendCounter} days.`);

        // If todays price is lower than yesterday, we end the trend
      }

      ///////7

      ////////
      else if (closingToday < closingYesterday) {
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
          longestTrends.firstLength > 1
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
        trendCounter = 1;
      }
    }
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
  },
  async volumesAndPriceChanges(array) {
    let newArray = [];
    array.forEach((item) =>
      newArray.push({
        Date: item.Date,
        Volume: item.Volume,
        Change: helpers.countDifference(item.High, item.Low),
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
  },
  // Returns all entries from object between given date range and also dates before the start day, according to mode (how many past entries)
  // Throws error if time range doesn't match with given data.
  // Read csv file to json
  readFileToJson: async (file) => {
    let entries = await csv().fromFile(file);
    return entries;
  },
  entriesByDate(obj, mode, dates) {
    let chosenEntries = [];
    // Format each entry to date objects, integers and floats
    obj.forEach((item) => {
      item.Date = new Date(item.Date);
      item["Close/Last"] = helpers.formatStockMoney(item["Close/Last"]);
      item.Volume = parseInt(item.Volume);
      item.Open = helpers.formatStockMoney(item.Open);
      item.High = helpers.formatStockMoney(item.High);
      item.Low = helpers.formatStockMoney(item.Low);
    });
    obj.sort((a, b) => {
      return a.Date - b.Date;
    });
    if (!dates.custom) {
      dates.first = obj[mode].Date;
      dates.last = obj[obj.length - 2].Date;
    }
    if (
      dates.first.getTime() < obj[0].Date.getTime() ||
      dates.last.getTime() > obj[obj.length - 1].Date.getTime()
    ) {
      throw new Error("Dates don't match");
    }
    // Find array objects within range
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].Date.getTime() === dates.first.getTime()) {
        for (let j = mode; j >= 0; j--) {
          chosenEntries.push(obj[i - j]);
          // console.log(`added to arhay ${obj[i - j].Date.toDateString()}`);
        }
      } else if (
        obj[i].Date.getTime() >= dates.first.getTime() &&
        obj[i].Date.getTime() < dates.last.getTime()
      ) {
        chosenEntries.push(obj[i]);
        // console.log(`added to arhay ${obj[i].Date.toDateString()}`);
      }
      if (obj[i].Date.getTime() === dates.last.getTime()) {
        chosenEntries.push(obj[i]);
        // console.log(`added to arhay ${obj[i].Date.toDateString()}`);
        // If mode is 1 (searching for trends), lets add one more
        if (mode === 1) {
          chosenEntries.push(obj[i + 1]);
          // console.log(`added to arhay ${obj[i + 1].Date.toDateString()}`);
        }
      }
    }
    return chosenEntries;
  },
};

module.exports = finders;
