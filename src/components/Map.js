import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import PropTypes from 'prop-types';
import Overlay, { DrawingTools } from './Overlay';

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
    }
  }

  onReady(map, maps){
    this.setState({ map: map, maps:maps, mapLoaded: true });
    this.props.setMapRef(map, maps);
  }

  render() {
    return (
      <div className="container">
        { this.overlay && <MapControls toggleIsDrawing={this.toggleIsDrawing}
                                       map={this.state.map}
                                       maps={this.state.maps}
                                       stopDrawing={this.overlay.stopDrawing}/> }
        <div className="container" id="map-container">
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
            { this.state.mapLoaded && <Overlay ref={instance => {this.overlay = instance;}}
                                               map={this.state.map}
                                               maps={this.state.maps}/> }
          </div>
        </div>
      </div>
    );
  }
}

class MapControls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawing: false
    }

    this.toggleIsDrawing = this.toggleIsDrawing.bind(this);
    this.drawClick = this.drawClick.bind(this);
    this.finishClick = this.finishClick.bind(this);
  }

  toggleIsDrawing() {
    if(this.state.isDrawing) {
      this.setState({isDrawing: false});
    } else {
      this.setState({isDrawing: true});
    }
  }

  drawClick() {
    this.toggleIsDrawing();
  }

  finishClick() {
    this.props.stopDrawing(this.drawingTools);
    this.toggleIsDrawing();
  }

  render() {
    let finishButton = <button id="stop-draw-button" onClick={this.finishClick}>FINISH</button>;
    let drawButton = <button id="draw-button" onClick={this.drawClick}>DRAW</button>;

    return (
      <div id="map-controls" className="side-panel">
        { this.state.isDrawing ? <DrawingTools ref={instance => {this.drawingTools = instance;}} map={this.props.map} maps={this.props.maps}/> : drawButton }
        { this.state.isDrawing ? finishButton : null }
      </div>
    )
  }
}

//{ this.state.isDrawing ? stopDrawButton : null }
