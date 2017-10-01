import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import PropTypes from 'prop-types';

/*================================
Receives a pointer to the index.js object in props
================================*/
export default class Map extends Component {
  constructor(props) {
    super(props);
  }

  onReady(map, maps){
    this.props.index.map = map;
    this.props.index.maps = maps;
  }

  render() {
    return (
      <GoogleMap
        bootstrapURLKeys={{key:"AIzaSyB4CMvWi4j-iLXGCKVw_zCIoHrLI18iK4U&libraries=places"}}
        center={{lat: 53.5444, lng: -113.4909}}
        zoom={10}
        onGoogleApiLoaded={({map, maps}) => this.onReady(map, maps)}
        yesIWantToUseGoogleMapApiInternals={true}
        >
      </GoogleMap>
    );
  }
}
