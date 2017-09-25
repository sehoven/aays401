import React, {Component} from 'react';
import GoogleMap from 'google-map-react';
import {List} from 'immutable';

const FloatingComponent = ({ text }) => <div width="50px">{text}</div>;

function onMapReady(maps) {
  maps.setPadding(400,400,500,500);
}

export class Map extends Component {
  constructor(props) {
    super(props);
    this.zoom = 10,
    this.center = new List([53.5444, -113.4909]),
    this.apiKey = "AIzaSyB4CMvWi4j-iLXGCKVw_zCIoHrLI18iK4U"
    this.map = ''
    this.maps = ''
  }

  onReady(map, maps){
    this.map = map
    this.maps = maps
    //Exposing the Google API
  }

  render() {
    return (
      <GoogleMap
        bootstrapURLKeys={{key:"AIzaSyB4CMvWi4j-iLXGCKVw_zCIoHrLI18iK4U"}}
        center={{lat: 53.5444, lng: -113.4909}}
        zoom={10}
        onGoogleApiLoaded={({map, maps}) => this.onReady(map, maps)}
        yesIWantToUseGoogleMapApiInternals={true}
        >
        <FloatingComponent
          text={"Floating stuff"}
          lat={53.5444}
          lng={-113.4909}
          />
      </GoogleMap>
    );
  }
}
