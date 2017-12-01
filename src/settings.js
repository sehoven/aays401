/*
THIS IS THE STYLE FOR THE MAP OUTPUT THAT CAN BE PRINTED
A NEW STYLE URL CAN BE GENERATED AT https://mapstyle.withgoogle.com/

VERIFY WITH IT SUPPORT BEFORE MAKING ANY PERMANENT CHANGES. IT IS IMPORTANT
THAT THE URL DEFINES PRECISELY format, maptype AND style ONLY, OR IT WILL NOT
WORK WITH THE APPLICATION.

PROVIDED BELOW IS THE STYLE IN A FORMAT THAT IS ACCEPTED BY THE ABOVE WEBPAGE
AS A STARTING POINT FOR STYLING MAPS. SIMPLY VISIT THE PAGE, CLICK ON
"import JSON", AND PASTE THE TEXT BELOW. AFTER CLICKING FINISH,
COPY THE CORRECT SNIPPET FROM UNDER
"Grab the URL for the Google Static Maps API." AND REPLACE THE QUOTED TEXT
FOLLOWING 'CONST STATIC_STYLE'.

IT IS STRONGLY ADVISED TO GET ASSISTANCE FROM TECH SUPPORT UNLESS YOU ARE SURE
OF WHAT YOU ARE DOING.

COPY BETWEEN THE BELOW LINE
[
  {
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#f5fcf8"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#000000"
      },
      {
        "weight": 7
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#ffffff"
      },
      {
        "weight": 3
      }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#797979"
      },
      {
        "weight": 2.5
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "stylers": [
      {
        "color": "#aed581"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#b0bec5"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "stylers": [
      {
        "color": "#80deea"
      }
    ]
  }
]
AND UP TO THE ABOVE LINE */
export const STATIC_STYLE = "&format=png&maptype=roadmap&style=element:geometry.fill%7Ccolor:0xf5fcf8&style=element:labels.icon%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x000000%7Cweight:7&style=element:labels.text.stroke%7Ccolor:0xffffff%7Cweight:3&style=feature:landscape.man_made%7Celement:geometry.stroke%7Ccolor:0x797979%7Cweight:2.5&style=feature:poi%7Celement:labels.text%7Cvisibility:off&style=feature:poi.business%7Celement:labels.icon%7Cvisibility:off&style=feature:poi.park%7Ccolor:0xaed581&style=feature:road%7Celement:geometry.fill%7Ccolor:0xb0bec5&style=feature:road%7Celement:geometry.stroke%7Cvisibility:off&style=feature:transit%7Cvisibility:off&style=feature:water%7Ccolor:0x80deea";

/*
THE FOLLOWING IS THE DIMENSIONS OF THE PRINTABLE IMAGE OUTPUT. THE FREE PLAN
WILL ALLOW FOR UP TO 640x640, SO THAT IS WHAT IS WRITTEN HERE. THIS CAN BE
CHANGED TO UP TO 2048x2048 IF A PREMIUM PLAN IS PURCHASED FROM GOOGLE, WHICH
WILL ALLOW FOR A GREATER LEVEL OF DETAIL. */
export const IMAGE_DIMENSIONS = "640x640";

/*
THE FOLLOWING IS THE ADDRESS OF THE MACHINE RUNNING THE node.js SERVER, AND
LIKELY THE DATABSE AS WELL. ENSURE THE FIREWEALL IS SET TO ALLOW TRAFFIC */
const SERVER_ADDRESS = "http://localhost:3000/";
/*
THE NEXT FEW ADDRESSES WILL RESPOND AUTOMATICALLY TO CHANGING THE ABOVE LINE,
BUT MUST BE PRESENT HERE. THEY ARE NOT TO BE CHANGED */
export const LOCATIONS_ADDRESS = `${SERVER_ADDRESS}locations?`;
export const COUNT_ADDRESS = `${SERVER_ADDRESS}addressCount`;
export const LOGIN_ADDRESS = `${SERVER_ADDRESS}login`;
export const SIGNUP_ADDRESS = `${SERVER_ADDRESS}signup`;
export const LOGOUT_ADDRESS = `${SERVER_ADDRESS}logout`;
export const USERAUTHCHECK_ADDRESS = `${SERVER_ADDRESS}userAuthCheck`;
