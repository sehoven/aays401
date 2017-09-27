var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());

dummyLocations = [];
var Belvedere = {
  name: "Belvedere",
  lat: 53.5910582,
  lng: -113.4393493
};
var Manning = {
  name: "Manning",
  lat: 53.635534,
  lng: -113.3957664
};
dummyLocations.push(Belvedere);
dummyLocations.push(Manning);

// Prepare Access-Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    //'GET, POST, OPTIONS, PUT, PATCH, DELETE'); Add as required
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Handle requests to "/HelloWorld"
app.get('/HelloWorld', function(req, res) {
  console.log("Hello World request handler invoked");
  res.writeHead(200, {"Content-Type": "application/json"});
  var json = JSON.stringify({
    text: "Hello World"
  });
  res.end(json);
})

// Handle requests to "/nearby"
// Returns all known locations that are within rad from point (lat, lng)
app.get('/nearby', function(req, res) {
  console.log("Location request handler invoked");
  if (!req.query.lat || !req.query.lng || !req.query.rad)
    return res.sendStatus(400);

  let resBody = []
  for (var i = 0; i < dummyLocations.length; i++) {
    var a = req.query.lat - dummyLocations[i].lat
    var b = req.query.lng - dummyLocations[i].lng

    if (Math.sqrt( a*a + b*b ) < req.query.rad){
        resBody.push(dummyLocations[i]);
    }
  }

  res.writeHead(200, {"Content-Type": "application/json"});
  var json = JSON.stringify(resBody);
  res.end(json);
})

app.listen(3000);
