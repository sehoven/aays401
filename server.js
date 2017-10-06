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
// Load local neighbourhood data synchronously
console.log("Loading data into memory...");
var locations_data = require('./data/locations.json');
var locations = fs.readFileSync('./data/locations.json', 'utf8');
locations = JSON.parse(locations);
locations = locations.addresses;
console.log("Ready. Listening on port 3000.");

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

    if (Math.sqrt( a*a + b*b ) < c){
        resBody.push(neighborhoods[i]);
    }
  }

  res.writeHead(200, {"Content-Type": "application/json"});
  var json = JSON.stringify(resBody);
  res.end(json);
});

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
  let resBody = [];
  for (var i = 0; i < neighborhoods.length; i++) {
    if (searchTerm) {
      if (!neighborhoods[i].name.toLowerCase().includes(searchTerm)) continue;
    }
    resBody.push(neighborhoods[i]);
  }

  res.writeHead(200, {"Content-Type": "application/json"});
  var json = JSON.stringify(resBody);
  res.end(json);
});

app.post('/addressCount', function(req, res) {
  console.log("Count request handler invoked");
  if (!req.body) return res.sendStatus(400);
  if (!req.body.poly || !req.body.center || !req.body.radius) {
    return res.sendStatus(400);
  }
  if (req.body.poly.length < 2) {
    res.sendStatus(400);
    return;
  }
  var top = -999,
      bot = 999,
      lft = 999,
      rgt = -999;
  for (let i = 0; i < req.body.poly.length; i++){
    top = Math.max(req.body.poly[i].lat, top);
    bot = Math.min(req.body.poly[i].lat, bot);
    rgt = Math.max(req.body.poly[i].lng, rgt);
    lft = Math.min(req.body.poly[i].lng, lft);
  }
  console.log("Filtering latitudes between ", bot, "and", top);
  resBody = locations.sliceRange(bot, top, "lat");
  console.log("Filtering longitudes between ", lft, "and", rgt);
  resBody = resBody.sliceRange(lft, rgt, "lng");
  console.log("Returning", resBody.length, "addresses");
  res.writeHead(200, {"Content-Type": "application/json"});
  var json = JSON.stringify(resBody);
  res.end(json);
})

app.listen(3000);

Array.prototype.sliceRange = function(min, max, property) {
    if (min > max) return this.sliceRange(max, min);
    var l = 0,
        c = this.length - 1,
        r = c;
    while (l < c) {
        var m = Math.floor(l + (c - l) / 2);
        if (this[m].center[property] < min)
            l = m + 1;
        else
            c = m;
    }
    while (c < r) {
        var m = Math.ceil(c + (r - c) / 2);
        if (this[m].center[property] > max)
            r = m - 1;
        else
            c = m;
    }
    return this.slice(l, r+1);
}
