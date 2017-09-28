import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import PropTypes from 'prop-types';

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.map = '';
    this.maps = '';
    this.searchBox;
    this.onReady;
  }

  onReady(map, maps){
    this.props.index.state.map = map;
    this.props.index.state.shared = this.searchClicked;

    if (!this.searchBox){
      var searchBox = new google.maps.places.SearchBox(this.props.index.state.textInput);
      searchBox.addListener('places_changed', function() {
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }

          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });
    }
  }

  searchClicked(text, input, index){
    console.log(text, input, index);
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
