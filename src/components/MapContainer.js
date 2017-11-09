import React, { Component } from 'react';
import Map from './Map.js'

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

  render() {
    return <Map setMapRef={this.props.setMapRef} />
  }
}
