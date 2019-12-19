const express = require('express');
//const parse = require('csv-parse');

const sqlite3 = require('sqlite3');
const cors = require('cors');
const bodyParser = require('body-parser');
const {createCountryTable, createGoldMedalTable, goldMedalNumber, bestYear, mostSummerWins, mostWinterWins, bestDiscipline, bestSport, bestEvent, numberMenMedalists, numberWomenMedalists, mostMedaledAthlete, orderedMedals, orderedSports} = require('./sql');

const db = new sqlite3.Database('./gold_medals.sqlite');

const app = express();

module.exports = app;

const PORT = process.env.PORT || 4001;

// Allow cross-origin requests
app.use(cors());

// Middware for parsing request bodies
app.use(bodyParser.json());

const lowerCaseObjectKeys = (questionableKeys) => { // Make properties lowercase. For example: questionableKeys = {Country: Afghanistan, Code: AFG, Population: 32526562}

  let lowerCaseKeys = {};
  for (const prop in questionableKeys) { // Loop through properties in object
    if (prop.toLowerCase().indexOf('count') !== -1) { // If 'count' is in property name
      lowerCaseKeys.count = questionableKeys[prop]; //
    } else {
      lowerCaseKeys[prop.toLowerCase()] = questionableKeys[prop]; // For example: lowerCaseKeys[country] = 'Afghanistan'
    }
  }
  return lowerCaseKeys; // For example: returns questionableKeys = {country: Afghanistan, code: AFG, population: 32526562}
};

const fixCountryName = countryName => {
  // Fixes case for country names. https://www.w3schools.com/jsref/jsref_obj_regexp.asp
  return countryName.replace(/\w\S*/g, txt => {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

app.get('/country/:countryName', (req, res, next) => {
  const countryName = fixCountryName(req.params.countryName); //Fix case for country name

  // Assign queries
  const goldMedalQuery = goldMedalNumber(countryName);
  const summerWinsQuery = mostSummerWins(countryName);
  const winterWinsQuery = mostWinterWins(countryName);
  const disciplineQuery = bestDiscipline(countryName);
  const sportQuery = bestSport(countryName);
  const eventQuery = bestEvent(countryName);
  const menMedalistsQuery = numberMenMedalists(countryName);
  const womenMedalistsQuery = numberWomenMedalists(countryName);
  const yearQuery = bestYear(countryName);
  const mostMedalsQuery = mostMedaledAthlete(countryName);

  let country = {'name': countryName};
  db.serialize(() => {
    db.parallelize(() => { // Run methods in parallel
      // Add population & gdp to country object
      db.get("SELECT * FROM Country WHERE name = $name", {$name: countryName}, (err, row) => {
        if (err) {
          console.log(`Error while finding country details for ${countryName}.`);
          console.log(err);
        }
        if (row) {
          country.gdp = row.gdp;
          country.population = row.population;
        } else {
          country.gdp = '-';
          country.population = '-';
        }
      });

      // Add # of gold medals to country object
      db.get(goldMedalQuery, (err, row) => {
        if (err) {
          console.log(`Error while finding number of gold medals for ${countryName}.`);
          console.log(err);
        }
        if (row) {
          const lowerRow = lowerCaseObjectKeys(row);
          country.numberMedals = lowerRow.count;
        } else {
          country.numberMedals = '-';
        }
      });

      // Add best year to country object
      db.get(yearQuery, (err, row) => {
        if (err) {
          console.log(`Error while finding the best year for ${countryName}.`);
          console.log(err);
        }
        if (row) {
          const lowerRow = lowerCaseObjectKeys(row);
          const yearString = `${lowerRow.year} (${lowerRow.count} awards)`;
          country.bestYear = yearString;
        } else {
          country.bestYear = '-';
        }
      });

      // Add summer wins to country object
      db.get(summerWinsQuery, (err, row) => {
        if (err) {
          console.log(`Error while finding summer wins for ${countryName}.`);
          console.log(err);
        }
        if (row) {
          const lowerRow = lowerCaseObjectKeys(row);
          const summerString = `${lowerRow.year} (${lowerRow.count} medals)`;
          country.bestSummer = summerString;
        } else {
          country.bestSummer = '-';
        }
      });

      // Add winter wins to country object
      db.get(winterWinsQuery, (err, row) => {
        if (err) {
          console.log(`Error while finding winter wins for ${countryName}.`);
          console.log(err);
        }
        const lowerRow = lowerCaseObjectKeys(row);
        if (row) {
          const winterString = `${lowerRow.year} (${lowerRow.count} medals)`;
          country.bestWinter = winterString;
        } else {
          country.bestWinter = '-';
        }
      });

      // Add best discipline to country object
      db.get(disciplineQuery, (err, row) => {
        if (err) {
          console.log(`Error while finding best discipline for ${countryName}.`);
          console.log(err);
        }
        if (row) {
          const lowerRow = lowerCaseObjectKeys(row);
          const disciplineString = `${lowerRow.discipline} (${lowerRow.count} medals)`;
          country.bestDiscipline = disciplineString;
        } else {
          country.bestDiscipline = '-';
        }
      });

      // Add best sport to country object
      db.get(sportQuery, (err, row) => {
        if (err) {
          console.log(`Error while finding best sport for ${countryName}.`);
          console.log(err);
        }
        if (row) {
          const lowerRow = lowerCaseObjectKeys(row);
          const sportString = `${lowerRow.sport} (${lowerRow.count} medals)`;
          country.bestSport = sportString;
        } else {
          country.bestSport = '-';
        }
      });

      // Add best event to country object
      db.get(eventQuery, (err, row) => {
        if (err) {
          console.log(`Error while finding best event for ${countryName}.`);
          console.log(err);
        }
        if (row) {
          const lowerRow = lowerCaseObjectKeys(row);
          const eventString = `${lowerRow.event} (${lowerRow.count} medals)`;
          country.bestEvent = eventString;
        } else {
          country.bestEvent = '-';
        }
      });

      // Add men medalists to country object
      db.get(menMedalistsQuery, (err, row) => {
        if (err) {
          console.log(`Error while finding men medalists for ${countryName}.`);
          console.log(err);
        }
        if (row) {
          const lowerRow = lowerCaseObjectKeys(row);
          country.maleMedalists = lowerRow.count;
        } else {
          country.maleMedalists = '-';
        }
      });

      // Add women medalists to country object
      db.get(womenMedalistsQuery, (err, row) => {
        if (err) {
          console.log(`Error while finding women medalists for ${countryName}.`);
          console.log(err);
        }
        if (row) {
          const lowerRow = lowerCaseObjectKeys(row);
          country.femaleMedalists = lowerRow.count;
        } else {
          country.femaleMedalists = '-';
        }
      });

      // Add most decorated to country object
      db.get(mostMedalsQuery, (err, row) => {
        if (err) {
          console.log(`Error while finding most decorated athlete for ${countryName}.`);
          console.log(err);
        }
        if (row) {
          const lowerRow = lowerCaseObjectKeys(row);
          country.mostMedalsAthlete = lowerRow.name;
        } else {
          country.mostMedalsAthlete = '-';
        }
      });
    });

    db.get("SELECT * FROM GoldMedal LIMIT 1;", (err, row) => {
      res.json(country); //Send response object to '/country/:countryName' route
    });

  });
});


// Start the server listening at PORT below:
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
