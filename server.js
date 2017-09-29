const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

// Load local neighbourhood data synchronously
console.log("Loading data into memory...");
var neighborhood_data = require('./data/neighborhoods.json');
var neighborhoods = fs.readFileSync('./data/neighborhoods.json', 'utf8');
neighborhoods = JSON.parse(neighborhoods);
neighborhoods = neighborhoods.neighborhoods;
console.log("Ready. Server Started.");

app.use(bodyParser.json());

// Prepare Access-Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    //'GET, POST, OPTIONS, PUT, PATCH, DELETE'); Add as required
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Handle requests to "/nearby"
// Returns all known neighborhoods that are within rad from point (lat, lng)
app.get('/nearby', function(req, res) {
  console.log("Location request handler invoked");
  //Should add some kind of type validation here.. and everywhere.
  if (!req.query.lat || !req.query.lng || !req.query.rad)
    return res.sendStatus(400);

  let resBody = [];
  for (var i = 0; i < neighborhoods.length; i++) {
    var c = parseFloat(req.query.rad) + neighborhoods[i].radius;
    var a = parseFloat(req.query.lat) - neighborhoods[i].center.lat;
    var b = parseFloat(req.query.lng) - neighborhoods[i].center.lng;

    console.log(a, b, c);

    if (Math.sqrt( a*a + b*b ) < c){
        resBody.push(neighborhoods[i]);
    }
  }

  res.writeHead(200, {"Content-Type": "application/json"});
  var json = JSON.stringify(resBody);
  res.end(json);
})

// Handle requests to "/locations"
// Returns all known locations that match existing query items
app.get('/locations', function(req, res) {
  console.log("Location request handler invoked");
  if (!req.query) return res.sendStatus(400);
  if (req.query.name == '') {
    res.end(JSON.stringify([]));
    return;
  }

  let searchTerm = req.query.name.toLowerCase();
  console.log(searchTerm);
  let resBody = [];
  for (var i = 0; i < dummyLocations.length; i++) {
    if (searchTerm) {
      if (!dummyLocations[i].name.toLowerCase().includes(searchTerm)) continue;
    }
    resBody.push(dummyLocations[i]);
  }

  res.writeHead(200, {"Content-Type": "application/json"});
  var json = JSON.stringify(resBody);
  res.end(json);
})

app.listen(3000);
