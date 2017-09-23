import React, {Component} from 'react';
import GoogleMap from 'google-map-react';

import {List} from 'immutable';

export class Map extends Component {
  constructor(props) {
    super(props);
    this.zoom = 10,
    this.center = new List([53.5444, -113.4909]),
    this.apiKey = "AIzaSyB4CMvWi4j-iLXGCKVw_zCIoHrLI18iK4U"
  }

  render() {
    return (
      <GoogleMap
        bootstrapURLKeys={{key:"AIzaSyB4CMvWi4j-iLXGCKVw_zCIoHrLI18iK4U"}}
        center={{lat: 53.5444, lng: -113.4909}}
        zoom={10}
        >
      </GoogleMap>
    );
  }
}
