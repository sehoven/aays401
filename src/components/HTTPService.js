const fetch = require('node-fetch');

export function getUnits(points) {
  let body = JSON.stringify({ "poly" : points});
  return fetch( `http://localhost:3000/getUnits` ,
                { "method": 'POST',
                  "body": body,
                  "headers": {  'Content-Type': 'application/json',
                                'Content-Length': new Buffer(body).length }})
    .then(function(res) {
        return res.json();
    });
}

export function searchLists(term) {
  return fetch(` http://localhost:3000/locations?name=${term}` )
    .then(function(response) {
      return response.json();
    });
}

export function countPolyResidences(polyData) {
  let body = JSON.stringify({ "poly" : polyData.points});
  return fetch( `http://localhost:3000/addressCount` ,
                { "method": 'POST',
                  "body": body,
                  "headers": {  'Content-Type': 'application/json',
                                'Content-Length': new Buffer(body).length }})
    .then(function(res) {
        return res.json();
    });
}

export function login(info) {
  let body = JSON.stringify({ "username" : info.username,"password":info.password});
  return fetch( ` http://localhost:3000/login` ,
                { "method": 'POST',
                  "body": body,
                  "headers": {  'Content-Type': 'application/json',
                  'Content-Length': new Buffer(body).length }})
    .then(function(res) {
      return res.json();
  });

}

export function signup(info) {
  let body = JSON.stringify({ "username" : info.username,"password":info.password,"email":info.email});
  return fetch( ` http://localhost:3000/signup` ,
                { "method": 'POST',
                    "body": body,
                    "headers": {  'Content-Type': 'application/json',
                    'Content-Length': new Buffer(body).length }})
    .then(function(res) {
      return res.json();
  });

}