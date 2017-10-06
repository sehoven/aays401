import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import PropTypes from 'prop-types';
import Overlay from './Overlay';

/*================================
Receives a pointer to the index.js object in props
================================*/
export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapLoaded: false,
      map: null,
      maps: null
    }
  }

  onReady(map, maps){
    this.setState({ map: map, maps:maps, mapLoaded: true });
    this.props.setMapRef(map, maps);
  }

  render() {
    return (
      <div id="map-container">
        <div id="map">
          <GoogleMap
            bootstrapURLKeys={{key:"AIzaSyB4CMvWi4j-iLXGCKVw_zCIoHrLI18iK4U&libraries=places,drawing"}}
            center={{lat: 53.5444, lng: -113.4909}}
            zoom={10}
            onGoogleApiLoaded={({map, maps}) => this.onReady(map, maps)}
            yesIWantToUseGoogleMapApiInternals={true}>
          </GoogleMap>
        </div>
        <div id="overlay">
          { this.state.mapLoaded && <Overlay map={this.state.map} maps={this.state.maps}/> }
        </div>
      </div>
    );
  }
}
