import React, { Component } from 'react';
import Map from './Map.js'
import Tabs from './Tabs';

/*================================
Receives a pointer to setMapRef method in index.js for callback
to set map references to be used by Map.js and NavPanel.js.
================================*/
export default class MapContainer extends Component {
  constructor(props) {
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

  render() {
    return (
      <div className="fullScreen">
        { this.state.mapLoaded &&
          <Tabs
            map={this.state.map}
            maps={this.state.maps}
          />
        }
        <Map setMapRef={this.setMapRef.bind(this)} />
      </div>
    )
  }
}