var express = require('express');
var app = express();

// Prepare Access-Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
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

app.listen(3000);
