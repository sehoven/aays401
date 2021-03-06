/*You will need to fill in the password for the "postgres" database user you created
in the .env file
*/
const bcrypt = require('bcrypt');
const saltRounds = 10;
const simplify = require('simplify-geometry');
const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const inside = require('point-in-polygon');
const fs = require('fs');
const Client = require('pg');
require('dotenv').load();
const connectionString = 'postgresql://'+process.env.databaseUser+':'+process.env.databasePassword+'@localhost:'+process.env.databasePort+'/'+process.env.databaseName+''

// Prepare Access-Control
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  //'GET, POST, OPTIONS, PUT, PATCH, DELETE'); Add as required
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'same-origin');
  next();
});

app.use(bodyParser.json());

// Handle requests to "/locations"
// Returns all known locations that match existing query items
/**
 * @api {get} /locations/{text} Search Neighbourhoods
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
  });
  client.connect().catch(e => console.error('Connection Error', e.stack));

  var searchTerm = req.query.name.toLowerCase()+"%";
  var queryText = "SELECT * from aays.tblNeighbourhood where lower(Title) like $1;";
  var values = [searchTerm];
  client.query(queryText,values,function(err,result) {
      if(err){
        res.end(JSON.stringify([]));
        client.end()
        return;
      }

      let resBody = [];

      var searchTerm1 = "%"+req.query.name.toLowerCase()+"%";
      queryText = "SELECT * from aays.tblNeighbourhood where lower(Title) like $1 and lower(Title) not like $2 limit length($2)*5;";
      values = [searchTerm1,searchTerm];
      client.query(queryText,values,function(err1,resultinner) {
          if(err1){
            res.end(JSON.stringify([]));
            client.end()
            return;
          }
          client.end()

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

          for (let i=0;i<resultinner.rowCount;i++){
            let latLngs = [];
            let coords = [];
            // Converting to format requested by API
            if (resultinner.rows[i].latitude.length < 3) continue;
            for(let j = 0; j < resultinner.rows[i].latitude.length; ++j) {
              if (resultinner.rows[i].latitude[j] && resultinner.rows[i].longitude[j])
                coords.push([resultinner.rows[i].latitude[j], resultinner.rows[i].longitude[j]]);
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
              lat:resultinner.rows[i].centerlat,
              lng:resultinner.rows[i].centerlng
            };

            resBody.push({
              name:resultinner.rows[i].title,
              points:latLngs,
              radius:resultinner.rows[i].radius,
              width:resultinner.rows[i].width,
              height:resultinner.rows[i].height,
              center:centerLatLng
            });
          }

      var json = JSON.stringify(resBody);
      res.writeHead(200, {"Content-Type": "application/json"});
      res.end(json);
    });
  });
});

/**
 * @api {post} /addressCount/{Object[]} Location Counts
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

  let resBody = { "Residential":{"title":"Residential",
                                "total":0,
                                "Single Detached Home":0,
                                "Single Detached Home / Duplex":0,
                                "Townhome":0,
                                "Mobile Home": 0
                                },
                  "Apartment":{"title":"Apartment",
                              "total":0,
                              "Low Rise Apartments":0,
                              "Medium Rise Apartments":0,
                              "High Rise Apartments":0
                  },
                  "Industrial": {"title":"Industrial","total":0},
                  "Commercial": {"title":"Commercial","total":0},
                  "Other": 0
                  };

  //Connect to DB
  const client = new Client.Client({
    connectionString: connectionString,
  })
  client.connect()
  .catch(e => console.error('Connection Error', e.stack))

  let polygon = [];

  var maxLat=0;
  var maxLng=0;
  var minLat=0;
  var minLng=0;
  for (let i = 0; i < req.body.poly.length; i++){
    polygon.push([req.body.poly[i].lat, req.body.poly[i].lng]);
    if(maxLat<req.body.poly[i].lat){
      maxLat = req.body.poly[i].lat
    }
    if(maxLng<req.body.poly[i].lng){
      maxLng = req.body.poly[i].lng
    }
    if(minLng>req.body.poly[i].lng){
      minLng = req.body.poly[i].lng
    }
    if(minLat>req.body.poly[i].lat){
      minLat = req.body.poly[i].lat
    }
  }

  var queryText = 'SELECT code.subvalue as subvalue,code.value as type, prop.latitude as lat, prop.longitude as lng from aays.tblProperty prop left join aays.luzoningcodes code on code.zoningcode = prop.zoningcode where prop.latitude BETWEEN $1 AND $2 AND prop.longitude BETWEEN $3 AND $4;';
  var values = [minLat,maxLat,minLng,maxLng];
  client.query(queryText,values,function(err,result) {
    if(err){
      console.log(err);
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
            resBody.Residential.total++;
            switch(result.rows[item].subvalue){
              case 'Single Detached Home':
                resBody.Residential["Single Detached Home"]++;
                break;
              case 'Single Detached Home / Duplex':
                resBody.Residential["Single Detached Home / Duplex"]++;
                break;
              case 'Townhome':
                resBody.Residential["Townhome"]++;
                break;
              case 'Motor Home':
                resBody.Residential["Motor Home"]++;
                break;
            }
            break;
          case 'Apartment':
            resBody.Apartment.total++;
            switch(result.rows[item].subvalue){
              case 'Low Rise Apartments':
                resBody.Apartment["Low Rise Apartments"]++;
                break;
              case 'Medium Rise Apartment':
                resBody.Apartment["Medium Rise Apartments"]++;
                break;
              case 'High Rise Apartments':
                resBody.Apartment["High Rise Apartments"]++;
                break;
            }
            break;
          case 'Industrial':
            resBody.Industrial.total++;
            break;
          case 'Commercial':
            resBody.Commercial.total++;
            break;
          default:
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

app.post('/getUnits', function(req, res) {
  console.log("Unit request handler invoked");
  if (!req.body) return res.sendStatus(400);
  if (!req.body.poly) {
    return res.sendStatus(400);
  }
  if (req.body.poly.length < 2) {
    res.sendStatus(400);
    return;
  }

  //Connect to DB
  const client = new Client.Client({
    connectionString: connectionString,
  })
  client.connect()
  .catch(e => console.error('Connection Error', e.stack));

  let polygon = [];

  var maxLat=0;
  var maxLng=0;
  var minLat=0;
  var minLng=0;

  for (let i = 0; i < req.body.poly.length; i++){
    polygon.push([req.body.poly[i].lat, req.body.poly[i].lng]);
    if(maxLat<req.body.poly[i].lat){
      maxLat = req.body.poly[i].lat
    }
    if(maxLng<req.body.poly[i].lng){
      maxLng = req.body.poly[i].lng
    }
    if(minLng>req.body.poly[i].lng){
      minLng = req.body.poly[i].lng
    }
    if(minLat>req.body.poly[i].lat){
      minLat = req.body.poly[i].lat
    }
  }

  var queryText =   "SELECT latitude as lat, longitude as lng, codes.value as zc, count(*) ct "
                  + "FROM aays.tblProperty props "
                  + "LEFT JOIN aays.luzoningcodes codes on codes.zoningcode = props.zoningcode "
                  + "WHERE latitude BETWEEN $1 and $2 AND longitude BETWEEN $3 and $4 "
                  + "GROUP BY latitude, longitude, zc;";

  var values = [minLat, maxLat, minLng, maxLng];

  let resBody = [];
  client.query(queryText, values, function(err, result) {
    if(err){
      client.end();
      return res.status(400).send(err);
    }
    client.end();

    for (var item in result.rows){
      let point = [result.rows[item].lat, result.rows[item].lng];
      if(inside(point, polygon)){
        resBody.push({lat: result.rows[item].lat,
                      lng: result.rows[item].lng,
                      type: result.rows[item].zc,
                      count: result.rows[item].ct });
      }
    }

    res.writeHead(200, {"Content-Type": "application/json"});
    var json = JSON.stringify(resBody);
    res.end(json);
  });
});
/**
 * @api {post} /login/{body[]} Login
 * @apiGroup User
 * @apiDescription Receives a username and password and authenticated is with the database, checking if the user indeed exists and also if the user is authenticated to login
 * @apiParam {Object[]} An array of username, password
 * @apiParamExample {body[]} :
 *                        "username": "username",
 *                        "password": "password"
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "login":"success",
        "reason": "",
        "code": 20
 *
 *    }
 * @apiError (User) {post} NullParameters The parameters required are null
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Null variables
 *    {
 *      "login":"fail",
        "reason":"Null variables",
        "code": 40
 *    }
 * @apiError (User) {post} DatabaseErrors There was some database error
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Database error
 *    {
 *      "login":"fail",
        "reason": "Database error",
        "code": 41
 *    }
 * @apiError (User) {post} UsernameTaken The username entered is taken by another user
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Username does not exist
 *    {
 *      "login":"fail",
        "reason": "Username does not exists",
        "code": 42
 *    }
 * @apiError (User) {post} NotAuthenticated The user is not able to login becasue he/she not authorized
* @apiErrorExample Error-Response:
 *    HTTP/1.1 400 User is not authenticated to login by DBA
 *    {
 *      "login":"fail",
        "reason": "This user has not been authenticated by DBA",
        "code": 42
 *    }
 * @apiError (User) {post} InvalidPassword Password provided does not match the correct password
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Invalid Password
 *    {
 *      "login":"fail",
        "reason": "Invalid password",
        "code": 42
 *    }
 */
app.post('/login', function(req, res,next) {
  console.log("Login request handler invoked");
  var json;
  var resBody=[];

  if (!req.body) return res.sendStatus(400);
  if(req.body.password=='' || req.body.username==''){
    resBody.push({
      "login":"fail",
      "reason":"Null variables",
      "code": 40
    });
    json = JSON.stringify(resBody);
    res.writeHead(400, {"Content-Type": "application/json"});
    res.end(json);
    return;
  }
  if( typeof req.body.password=='undefined' || typeof req.body.username =='undefined'){
    resBody.push({
      "login":"fail",
      "reason":"Null variables",
      "code": 40
      });
      json = JSON.stringify(resBody);
      res.writeHead(400, {"Content-Type": "application/json"});
      res.end(json);
      return;
  }

  var username = req.body.username;
  var password = req.body.password;
  //Connect to DB
  const client = new Client.Client({
    connectionString: connectionString,
  })
  client.connect()
  .catch(e => console.error('Connection Error', e.stack))

  var queryText = "SELECT * from aays.tbluserauth where username =$1;";
  var values = [username];
  client.query(queryText,values,function(err,result) {
      if(err){
        resBody.push({
          "login":"fail",
          "reason": "Database error",
          "code": 41
        });
        json = JSON.stringify(resBody);
        res.writeHead(400, {"Content-Type": "application/json"});
        res.end(json);
        client.end();
        return;
      }
      if(result.rowCount==0){
        resBody.push({
          "login":"fail",
          "reason": "Username does not exist",
          "code": 42
        });
        json = JSON.stringify(resBody);
        res.writeHead(400, {"Content-Type": "application/json"});
        res.end(json);
        client.end();
        return;
      }
      client.end();

      bcrypt.compare(password, result.rows[0].password, function(err, comp) {
        if(comp==true&&result.rows[0].authenticated==true){
          var now = new Date();
          var time = now.getTime();
          var expireTime = time + 1000 * 60 * 60 * 24 * 7;
          now.setTime(expireTime);
          resBody.push({
            "login":"success",
            "reason": "",
            "code": 20,
            "pseudoCookie": "authToken=two;expires="+now.toGMTString()+";path=/"
          });

          json = JSON.stringify(resBody);
          res.writeHead(200, {"Content-Type": "application/json"});
          res.end(json);
          return;
        }
        else if (comp==true &&(result.rows[0].authenticated==false||result.rows[0].authenticated==null)){
          resBody.push({
            "login":"fail",
            "reason": "This user has not been authenticated by DBA",
            "code": 42
          });
          json = JSON.stringify(resBody);
          res.writeHead(400, {"Content-Type": "application/json"});
          res.end(json);
          return;
        }
        else{
          resBody.push({
            "login":"fail",
            "reason": "Invalid password",
            "code": 42
          });
          json = JSON.stringify(resBody);
          res.writeHead(400, {"Content-Type": "application/json"});
          res.end(json);
          return;
        }
      });
  });
});

/**
 * @api {post} /signup/{body[]} Signup
 * @apiGroup User
 * @apiDescription Receives a username,email and password and checking if the either the username or email already exists. If not, the user is created, otherwise the user is returned a message that explains why the signup failed.
 * @apiParam {Object[]} An array of username, password, email
 * @apiParamExample {body[]} :
 *                        "username": "username",
 *                        "password": "password",
 *                        "email": "email"
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "login":"success",
        "reason": "",
        "code": 20
 *
 *    }
 * @apiError (User) {post} NullParameters The parameters required are null
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Null variables
 *    {
 *      "signup":"fail",
        "reason":"Null variables",
        "code": 40
 *    }
 * @apiError (User) {post} DatabaseErrors There was some database error
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Database error
 *    {
 *      "signup":"fail",
        "reason": "Database error",
        "code": 41
 *    }
 * @apiError (User) {post} UsernameTaken The username entered is taken by another user
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Username does not exist
 *    {
 *      "login":"fail",
        "reason": "This user has not been authenticated by DBA",
        "code": 42
 *    }
 * @apiError (User) {post} EmailTaken The email entered is taken by another user
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 400 Username does not exist
 *    {
 *      "signup":"fail",
        "reason": "Email is taken by another user",
        "code": 42
 *    }
 */
app.post('/signup', function(req, res,next) {
  console.log("signup request handler invoked");
  var resBody=[];
  var json;
  if (!req.body) return res.sendStatus(400);
  if(req.body.password=='' || req.body.username=='' || req.body.email==''){
    resBody.push({
      "signup":"fail",
      "reason":"Null variables",
      "code": 40
      });
      json = JSON.stringify(resBody);
      res.writeHead(400, {"Content-Type": "application/json"});
      res.end(json);
      return;
  }
  if( typeof req.body.password=='undefined' || typeof req.body.username =='undefined'|| typeof req.body.email=='undefined' ){
    resBody.push({
      "signup":"fail",
      "reason":"Null variables",
      "code": 40
      });
      json = JSON.stringify(resBody);
      res.writeHead(400, {"Content-Type": "application/json"});
      res.end(json);
      return;
  }
  //Connect to DB
  const client = new Client.Client({
    connectionString: connectionString,
  })
  client.connect()
  .catch(e => console.error('Connection Error', e.stack))

  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;
  var queryText = "";
  var value = [];

  //Username check
  queryText = "select * from aays.tbluserauth where username = $1;";
  value = [username];
  client.query(queryText,value,function(err,result) {
    if(err){
      resBody.push({
        "signup":"fail",
        "reason":"Database error",
        "code": 41
      });
      json = JSON.stringify(resBody);
      res.writeHead(400, {"Content-Type": "application/json"});
      res.end(json);
      client.end();
      return;
    }

    if(result.rowCount>0){
      resBody.push({
      "signup":"fail",
      "reason":"Username exists",
      "code": 42
      });
      json = JSON.stringify(resBody);
      res.writeHead(400, {"Content-Type": "application/json"});
      res.end(json);
      client.end();
      return;
    }

  //Email check
    queryText = "select * from aays.tbluserauth where email = $1;";
    value = [email];
    client.query(queryText,value,function(err,result) {
      if(err){
        resBody.push({
          "signup":"fail",
          "reason":"Database errorr",
          "code": 41
        });
        json = JSON.stringify(resBody);
        res.writeHead(400, {"Content-Type": "application/json"});
        res.end(json);
        client.end();
        return;
      }

      if(result.rowCount>0){
        resBody.push({
        "signup":"fail",
        "reason":"Sign up failed. Email is owned by another user",
        "code": 42
        });
        json = JSON.stringify(resBody);
        res.writeHead(400, {"Content-Type": "application/json"});
        res.end(json);
        client.end();
        return;
      }

      //Password Encryption
      bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {

          queryText = "insert into aays.tbluserauth(username,password,email,authenticated) Values($1,$2,$3,$4);";
          value=[username,hash,email,true]
          client.query(queryText,value,function(err,result) {
              if(err){
                resBody.push({
                  "signup":"fail",
                  "reason":"Database error",
                  "code": 41
                });
                json = JSON.stringify(resBody);
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(json);
                client.end();
                return;
              }

              resBody.push({
                  "signup":"success",
                  "reason":"",
                  "code": 20
              });

              json = JSON.stringify(resBody);
              res.writeHead(200, {"Content-Type": "application/json"});
              res.end(json);
              client.end();
              return;
          });
        });
      });
    });
  });
});

app.get('/logout', function(req, res,next){
    console.log("Logout handler envoked")
    var resBody=[];
    var json;
    req.session.destroy();
    resBody.push({});
    json = JSON.stringify(resBody);
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(json);
});

app.post('/userAuthCheck', function(req, res, next){
    console.log("Auth check handler envoked")
    var resBody=[];
    var json;
    let token = readCookie(req.body.cookie, "authToken");
    if(token){
      resBody.push({
        "value":true
      });
    }
    else{
      resBody.push({
        "value":false
      });
    }
    json = JSON.stringify(resBody);
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(json);
});

app.listen(3000, function(req,res) {
  console.log('API up and running...');
});

function readCookie(cookie, name) {
  var nameEQ = name + "=";
  var ca = cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
