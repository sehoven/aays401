// A simple  server. Run by calling
// >node server.js
// I believe we are to run this and a react client. The react client would
// be served on port 80 in production, and would make calls to this node
// server on another port for loading data.
var express = require('express');

var app = express();

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/HelloWorld', function(req, res) {
  console.log("Request handler invoked");
  res.writeHead(200, {"Content-Type": "application/json"});
  var json = JSON.stringify({
    text: "Hello World"
  });
  res.end(json);
})

app.listen(3000);
