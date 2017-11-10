const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const inside = require('point-in-polygon');
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
/**
 * @api {get} /nearby/{Object[]} Get nearby neighbourhoods
 * @apiGroup Polygon
 * 
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "neighborhoods"[{
 *          "name":"NiceAvenue",
 *          "points":[{"lat":-113,"lng":53},{"lat":-113,"lng":53}],
 *          "center":{"lat":-113,"lng":53},
 *          "radius":0.111
 *          "width":0.111
 *          "height":0.111
 *      }
 *    }
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Null parameters
 *    {
 *      "error":"Null parameters"
 *    }
 */
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
/**
 * @api {get} /locations/{text} List all neighbourhoods in Edmonton that match search string
 * @apiName locations
 * @apiGroup Polygon
 * @apiDescription Handle requests to /locations Returns all known locations that match existing query items
 * @apiParam {String} Any text that is reterived from search bar in the frontend
 * @apiError (Polygon) {get} NullParameters The parameters required are null
 * @apiParamExample {String} SearchString:
 *                        "Rutherford"
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "neighborhoods"[{
 *          "name":"NiceAvenue",
 *          "points":[{"lat":-113,"lng":53},{"lat":-113,"lng":53}],
 *          "center":{"lat":-113,"lng":53},
 *          "radius":0.111
 *          "width":0.111
 *          "height":0.111
 *      }
 *    }
 * @apiError (Polygon) {get} NullParameters The parameters required are null
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Null parameters
 *    {
 *      "error":"Null parameters"
 *    }
 */
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





/**
 * @api {post} /addressCount/{Object[]} Count addresses in a polygon
 * @apiGroup Polygon
 * @apiDescription Receives a array of coordinates and outputs the number of units in the polygon the points create
 * @apiParam {Object[]} An array of latitude, and longitude points.
 * @apiParamExample {Object[]} PolygonArray:
 *                        [{"lat":-113.11,"lng":56.232},{"lat":-113.11,"lng":56.232}]
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "residential": 112,
        "commercial": 4,
        "industrial": 2,
        "urban service": 1,
        "other": 6;
 *    }
 * @apiError (Polygon) {get} NullParameters The parameters required are null
 * @apiError (Polygon) {get} InvalidParameters The parameters required do not create a shape with area.
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Polygon is not a polygon
 *    {
 *      "error":"Polygon points dont exist or have less that two points (Not a shape)."
 *    }
 */
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
  let filtrate = filterBinary(locations, bot, top, "lat")
    .sort(function(a, b){
      return a.center.lng - b.center.lng;
  });
  filtrate = filterBinary(filtrate, lft, rgt, "lng");
  let resBody = { "residential": 0,
                  "commercial": 0,
                  "industrial": 0,
                  "urban service": 0,
                  "other": 0};
  let polygon = [];
  for (let i = 0; i < req.body.poly.length; i++){
    polygon.push([req.body.poly[i].lat, req.body.poly[i].lng]);
  }
  for (let i = 0; i < filtrate.length; i++){
    let point = [filtrate[i].center.lat, filtrate[i].center.lng];
    if (inside(point, polygon)) {
      resBody[filtrate[i].type] += 1;
    }
  }
  res.writeHead(200, {"Content-Type": "application/json"});
  var json = JSON.stringify(resBody);
  res.end(json);
});

app.listen(3000, function() {  
  console.log('API up and running...');
});
function binaryIndexOf(array, searchElement, property) {
  var minIndex = 0;
  var maxIndex = array.length - 1;
  var currentIndex;
  var currentElement;

  while (minIndex <= maxIndex) {
    currentIndex = (minIndex + maxIndex) / 2 | 0;
    currentElement = array[currentIndex].center[property];

    if (currentElement < searchElement) {
      minIndex = currentIndex + 1;
    }
    else if (currentElement > searchElement) {
      maxIndex = currentIndex - 1;
    }
  }
  return currentIndex;
}

function filterBinary(arr, min, max, property){
 let leftIndex = binaryIndexOf(arr, min, property);
 let rightIndex = binaryIndexOf(arr, max, property) + 1;
 return arr.slice(leftIndex, rightIndex);
}
