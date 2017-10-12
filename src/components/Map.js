import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import PropTypes from 'prop-types';
import Overlay from './Overlay';

const isFocus = {
  FALSE: 0,
  TRUE: 1
}

/*================================
Receives a pointer to the index.js object in props
================================*/
export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapLoaded: false,
      map: null,
      maps: null,
      isMapFocus: isFocus.FALSE,
      isOverlayFocus: isFocus.TRUE
    }
    this.changeFocus = this.changeFocus.bind(this);
  }

  onReady(map, maps){
    this.setState({ map: map, maps:maps, mapLoaded: true });
    this.props.setMapRef(map, maps);
  }

  changeFocus() {
    if(this.state.isMapFocus) {
      this.setState({isMapFocus: isFocus.FALSE, isOverlayFocus: isFocus.TRUE});
    } else if(this.state.isOverlayFocus) {
      this.setState({isOverlayFocus: isFocus.FALSE, isMapFocus: isFocus.TRUE});
    }
    console.log(this.state.isOverlayFocus);
  }

  render() {
    const mapStyle = {
      zIndex: this.state.isMapFocus
    }
    const overlayStyle = {
      zIndex: this.state.isOverlayFocus
    }
    return (
      <div id="map-container">
        <div id="map" style={mapStyle}>
          <GoogleMap
            bootstrapURLKeys={{key:"AIzaSyB4CMvWi4j-iLXGCKVw_zCIoHrLI18iK4U&libraries=places,drawing"}}
            center={{lat: 53.5444, lng: -113.4909}}
            zoom={10}
            onGoogleApiLoaded={({map, maps}) => this.onReady(map, maps)}
            yesIWantToUseGoogleMapApiInternals={true}>
          </GoogleMap>
        </div>
        <div id="overlay" style={overlayStyle}>
          { this.state.mapLoaded && <Overlay map={this.state.map}
                                             maps={this.state.maps}
                                             changeFocus={this.changeFocus}/> }
        </div>
      </div>
    );
  }
}
