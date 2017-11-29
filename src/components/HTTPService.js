const fetch = require('node-fetch');
import { LOCATIONS_ADDRESS, COUNT_ADDRESS,
          LOGIN_ADDRESS, SIGNUP_ADDRESS } from '../settings';

export function searchLists(term) {
  return fetch(`${LOCATIONS_ADDRESS}name=${term}` )
    .then(function(response) {
      return response.json();
    });

}

export function countPolyResidences(polyData) {
  let body = JSON.stringify({ "poly" : polyData.points});
  return fetch( `${COUNT_ADDRESS}`,
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
  return fetch(`${LOGIN_ADDRESS}`,
                { "method": 'POST',
                  "body": body,
                  "headers": {  'Content-Type': 'application/json',
                  'Content-Length': new Buffer(body).length }})
    .then(function(res) {
      return {
        statusCode: res.status,
        body: res.json()
      };
  });

}

export function signup(info) {
  let body = JSON.stringify({ "username" : info.username,"password":info.password,"email":info.email});
  return fetch(`${SIGNUP_ADDRESS}`,
                { "method": 'POST',
                    "body": body,
                    "headers": {  'Content-Type': 'application/json',
                    'Content-Length': new Buffer(body).length }})
    .then(function(res) {
      return {
        statusCode: res.status,
        body: res.json()
      };
  });

}
