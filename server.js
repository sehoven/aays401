// A simple  server. Run by calling
// >node server.js
// I believe we are to run this and a react client. The react client would
// be served on port 80 in production, and would make calls to this node
// server on another port for loading data.
var express = require('express');

var app = express();

app.get('/notes', function(req, res) {
  res.json({notes: "A note."})
})

app.listen(3000);
