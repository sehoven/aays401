var React = require('react');
var ReactDOM = require('react-dom');
import { Map } from './components/Map.js'
//import { Hello } from './components/HelloWorld.js'
import { Fetch } from './components/HelloWorld.js'
require('./styles/_style.sass');

const aURL =
  <a href="https://www.codecademy.com/articles/react-setup-i">
  The instructions I followed
  </a>;

// This is actually bad practice. At the highest level, only one DOM
// element in the html file should be called here. Others should be virtual
// or abstracted.
ReactDOM.render(
  <Fetch />,
  document.getElementById('hello')
);
ReactDOM.render(
  aURL,
  document.getElementById('message')
);
ReactDOM.render(
  <Map/>,
  document.getElementById('app')
);
