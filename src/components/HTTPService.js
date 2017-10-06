const fetch = require('node-fetch');

export function getNearby(lat, lng, rad) {
  return fetch(` http://localhost:3000/nearby?lat=${lat}&lng=${lng}&rad=${rad}` )
    .then(function(response) {
      return response.json();
    });
}

export function searchLists(term) {
  return fetch(` http://localhost:3000/locations?name=${term}` )
    .then(function(response) {
      return response.json();
    });

}

export function countPolyResidences(polyData) {
  console.log(polyData);
  let body = JSON.stringify({ "poly" : polyData.points,
                              "center" : polyData.center,
                              "radius": polyData.radius});
  return fetch( ` http://localhost:3000/addressCount` ,
                { "method": 'POST',
                  "body": body,
                  "headers": {  'Content-Type': 'application/json',
                                'Content-Length': new Buffer(body).length }})
    .then(function(res) {
        return res.json();
    });
}
