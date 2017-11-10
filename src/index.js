import React, { Component } from 'react';
import MapContainer from './components/MapContainer.js';
const ReactDOM = require('react-dom');

require('./styles/_style.sass');

export class Index extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <MapContainer />
    )
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('app')
);
