const React = require('react');
const ReactDOM = require('react-dom');
import { Map } from './components/Map.js'
import { NavPanel } from './components/NavPanel.js'

require('./styles/_style.sass');

ReactDOM.render(
  <div id="map"><NavPanel/><Map/></div>,
  document.getElementById('app')
);
