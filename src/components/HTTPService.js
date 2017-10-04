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

export function addresses(poly) {
  return fetch(` http://localhost:3000/addressCount?poly=${poly}` )
    .then(function(response) {
      return response.json();
    });
}
