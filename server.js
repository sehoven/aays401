/*You will need to fill in the password for the "postgres" database user you created
in the .env file
*/
const simplify = require('simplify-geometry');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const inside = require('point-in-polygon');
const fs = require('fs');
const Client = require('pg');
require('dotenv').load();
const connectionString = 'postgresql://'+process.env.databaseUser+':'+process.env.databasePassword+'@localhost:'+process.env.databasePort+'/'+process.env.databaseName+''

// Load local neighbourhood data synchronously

console.log("Ready. Listening on port 3000.");

app.use(bodyParser.json());

// Prepare Access-Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
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
  if ((typeof req.query.name==undefined) || (req.query.name == '')) {
    res.end(JSON.stringify([]));
    return;
  }

  //Connect to DB
  const client = new Client.Client({
    connectionString: connectionString,
  })
  client.connect()
  .catch(e => console.error('Connection Error', e.stack))


  let searchTerm = req.query.name.toLowerCase();
  var queryText = "SELECT * from aays.tblNeighbourhood where lower(Title) like '%"+searchTerm+"%';";
  client.query(queryText,function(err,result) {
      if(err){
        res.end(JSON.stringify([]));
        client.end()
        return;
      }
      client.end()

      let resBody = [];
      for (let i=0;i<result.rowCount;i++){
        let latLngs = [];
        let coords = [];
        // Converting to format requested by API
        if (result.rows[i].latitude.length < 3) continue;
        for(let j = 0; j < result.rows[i].latitude.length; ++j) {
          if (result.rows[i].latitude[j] && result.rows[i].longitude[j])
            coords.push([result.rows[i].latitude[j], result.rows[i].longitude[j]]);
        }
        //200 and 0.0001 are arbitrary thresholds, but I did a lot of testing
        //to get to them
        var simplified = (coords.length>200)?simplify(coords, 0.0001):coords;
        for(let j = 0; j < simplified.length; ++j) {
          latLngs.push({
            lat: simplified[j][0],
            lng: simplified[j][1]
          });
        }

        let centerLatLng = {
          lat:result.rows[i].centerlat,
          lng:result.rows[i].centerlng
        };

         resBody.push({
           name:result.rows[i].title,
           points:latLngs,
           radius:result.rows[i].radius,
           width:result.rows[i].width,
           height:result.rows[i].height,
           center:centerLatLng
         });
      }

      var json = JSON.stringify(resBody);
      res.writeHead(200, {"Content-Type": "application/json"});
      res.end(json);

  });
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
  if (!req.body.poly) {
    return res.sendStatus(400);
  }
  if (req.body.poly.length < 2) {
    res.sendStatus(400);
    return;
  }

  var results = [];

  let resBody = { "Residential": 0,
                  "Apartment": 0,
                  "Industrial": 0,
                  "Commercial": 0,
                  "UrbanService": 0,
                  "DirectDevelopmentControlProvision": 0,
                  "Other": 0,
                  "Agriculture":0
                  };

  //Connect to DB
  const client = new Client.Client({
    connectionString: connectionString,
  })
  client.connect()
  .catch(e => console.error('Connection Error', e.stack))


  var queryText = 'SELECT code.value as type, prop.latitude as lat, prop.longitude as lng from aays.tblProperty prop left join aays.luzoningcodes code on code.zoningcode = prop.zoningcode;';
  client.query(queryText,function(err,result) {
    if(err){
      client.end()
      return res.status(400).send(err);
    }
    client.end()

    //inside call required format to be [[[#,#],[#,#]...[#,#]]]
    let polygon = [];

    for (let i = 0; i < req.body.poly.length; i++){
      polygon.push([req.body.poly[i].lat, req.body.poly[i].lng]);
    }

    for(var item in result.rows){
      let point = [result.rows[item].lat,result.rows[item].lng];

      if(inside(point,polygon)){
        switch(result.rows[item].type){

          case 'Residential':
            resBody.Residential++;
            break
          case 'Apartment':
            resBody.Apartment++;
            break;
          case 'Industrial':
            resBody.Industrial++;
            break;
          case 'Commercial':
            resBody.Commercial++;
            break;
          case 'Urban Service':
            resBody.UrbanService++;
            break;
          case 'Direct Development Control Provision':
            resBody.DirectDevelopmentControlProvision++;
            break;
          case 'Agriculture':
            resBody.Agriculture++;
            break;
          case 'Other':
            resBody.Other++;
            break;
        }
      }
    }

    res.writeHead(200, {"Content-Type": "application/json"});
    var json = JSON.stringify(resBody);
    res.end(json);

  });
});

app.listen(3000, function() {
  console.log('API up and running...');
});
