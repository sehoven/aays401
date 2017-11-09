import React, { Component } from 'react';
import MapContainer from './components/MapContainer.js';
import Tabs from './components/Tabs';
const ReactDOM = require('react-dom');

require('./styles/_style.sass');

export class Index extends Component {
  constructor(props){
    super(props);
    this.state = {
      mapLoaded: false,
      map: null,
      maps: null
    }
  }

  setMapRef(map, maps) {
    this.setState({
      mapLoaded: true,
      map: map,
      maps: maps
    });
  }

  render(){
    return (
      <div className="fullScreen">
        <Tabs
          map={this.state.map}
          maps={this.state.maps}
        />
        <MapContainer setMapRef={this.setMapRef.bind(this)}/>
      </div>
    )
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('app')
);
