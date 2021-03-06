import React, { Component } from 'react';
import GoogleMap from 'google-map-react';

export default class Map extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <GoogleMap
        bootstrapURLKeys={{key:"AIzaSyB4CMvWi4j-iLXGCKVw_zCIoHrLI18iK4U&libraries=places,drawing"}}
        center={{lat: 53.5444, lng: -113.4909}}
        zoom={10}
        onGoogleApiLoaded={({map, maps}) => this.props.setMapRef(map, maps)}
        yesIWantToUseGoogleMapApiInternals={true}>
      </GoogleMap>
    )
  }
}
