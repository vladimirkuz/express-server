const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./gold_medals.sqlite');
const fs = require('fs'); // Node.js file system module allows you to work with the file system on your computer

db.serialize(() => {
  // Drop the tables if they exist
  db.run("DROP TABLE IF EXISTS Country;");
  db.run("DROP TABLE IF EXISTS GoldMedal;");

  const createCountryQuery = createCountryTable();
  const createGoldMedalQuery = createGoldMedalTable();

  // Create the country table
  if (createCountryQuery) {
    db.run(createCountryQuery, err => {
      if (err) {
        console.log("Error while creating the Country table!");
        console.log(err);
        return;
      }
    });
  }

  // Create the GoldMedal table
  if (createGoldMedalQuery) {
    db.run(createGoldMedalQuery, err => {
      if (err) {
        console.log("Error while creating the GoldMedal table!");
        console.log(err);
        return;
      }
    });
  }

  // Add the Country data
  db.run("DELETE FROM Country;", (err) => {
    if (err) {
      console.log("Country table not found!");
      console.log(err);
      return;
    } else {
      fs.createReadStream('data/country.csv')
      .pipe(parse({from: 2}))
      .on('data', function(csvrow) {
        db.run("INSERT INTO Country (name, code, population, gdp) VALUES ($name, $code, $population, $gdp)", {
          $name: csvrow[0],
          $code: csvrow[1],
          $population: csvrow[2],
          $gdp: csvrow[3]
        }, (err) => {
          if (err) {
            console.log("Error while inserting Country data");
            console.log(err);
            return;
          }
        });
      });
    }
  });

  // Add the GoldMedal data
  db.run("DELETE FROM GoldMedal;", (err) => {
    if (err) {
      console.log("GoldMedal table not found!");
      console.log(err);
      return;
    } else {
      let idCounter = 1;
      fs.createReadStream('data/goldmedal.csv')
      .pipe(parse({from: 2}))
      .on('data', function(csvrow) {
        db.run("INSERT INTO GoldMedal (id, year, city, sport, discipline, name, country, gender, event, season) VALUES ($id, $year, $city, $sport, $discipline, $name, $country, $gender, $event, $season)", {
          $id: idCounter,
          $year: csvrow[0],
          $city: csvrow[1],
          $sport: csvrow[2],
          $discipline: csvrow[3],
          $name: csvrow[4],
          $country: csvrow[5],
          $gender: csvrow[6],
          $event: csvrow[7],
          $season: csvrow[8]
        }, (err) => {
          if (err) {
            console.log("Error while inserting GoldMedal data");
            console.log(err);
            return;
          }
        });
        idCounter += 1;
      });
    }
  });
  db.get("SELECT name FROM GoldMedal LIMIT 1;", (err, row) => {
    console.log("Data successfully loaded");
  });
});
