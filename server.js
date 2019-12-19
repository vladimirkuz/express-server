const express = require('express');
const parse = require('csv-parse'); // Parse CSV files
const fs = require('fs'); // Node.js file system module allows you to work with the file system on your computer
const sqlite3 = require('sqlite3');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

module.exports = app;

const PORT = process.env.PORT || 4001;

// Allow cross-origin requests
app.use(cors());

// Middware for parsing request bodies
app.use(bodyParser.json());

//Create database
const db = new sqlite3.Database('./gold_medals.sqlite');

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

// Start the server listening at PORT below:
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
