const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const inside = require('point-in-geopolygon');

// Load local neighbourhood data synchronously
console.log("Loading data into memory...");
var neighborhood_data = require('./data/neighborhoods.json');
var neighborhoods = fs.readFileSync('./data/neighborhoods.json', 'utf8');
neighborhoods = JSON.parse(neighborhoods);
neighborhoods = neighborhoods.neighborhoods;

var addressess = fs.readFileSync('./data/locations.json', 'utf8');
addressess = JSON.parse(addressess);

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
})


/*Gets a array of arrays in the following format
[[lat,lng],[lat,lng],[lat,lng]]
 returns a count of how many residences are located in the shape those
 points make.

 Need to include a way to specify to include all all homes or to exclude business
 or apartments.

 Also should we move the loading of json to this function to avoid
 loading the json for other functions?
 */
app.get('/addressCount', function(req, res) {
  console.log("Address count request handler invoked");

  if (!req.query) return res.sendStatus(400);
  if (req.query.poly.length == 0) {
    res.end(JSON.stringify([]));
    return;
  }
  var count = 0;
  resBody = [];

  for (i = 0; i < addressess.length; i++) {
    
    if(inside.polygon(poly,[addressess[i].Latitude,addressess[i].Longitude]) && addressess[i].StreetName != ''){
      count = count+1;
    }
  }
  resBody.push(count);
  //Not sure why i need this
  res.writeHead(200, {"Content-Type": "application/json"});
  
  var json = JSON.stringify(resBody);
  res.end(json);
})

app.listen(3000);
