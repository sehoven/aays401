import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import PropTypes from 'prop-types';

export default class Overlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPolygon: null,
      overlay: this,
      visibility: true
    }
    this.selectPolygon = this.selectPolygon.bind(this);
    this.deselectPolygon = this.deselectPolygon.bind(this);
    this.deletePolygon = this.deletePolygon.bind(this);
  //  this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.setDrawingTools(this.props.map);
  }

  renderPolygon(map, coords) {
    let polygon = new google.maps.Polygon({
      paths: coords,
      strokeWeight: 0,
      fillOpacity: 0.45
    });
    polygon.setMap(map);
  }

  selectPolygon(polygon) {
    this.deselectPolygon();
    polygon.setEditable(true);
    this.setState({selectedPolygon: polygon});
  }

  deselectPolygon() {
    if(this.state.selectedPolygon) {
      this.state.selectedPolygon.setEditable(false);
      this.setState({selectedPolygon: null});
    }
  }

  deletePolygon(polygon) {
    polygon.setMap(null);
  }

  setDrawingTools(map) {
    // Keep reference to Overlay so we can call functions inside event listeners on map
    let overlay = this.state.overlay;

    let drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ["polygon"]
      },
      polygonOptions: {
        strokeWeight: 0,
        fillOpacity: 0.45,
        editable: true,
        zIndex: 1
      },
      map: map
    });

    this.setState({drawingManager: drawingManager});

    google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
      drawingManager.setDrawingMode(null);

      google.maps.event.addListener(polygon, "click", function(e) {
        if(e.vertex != null) {
          let path = polygon.getPaths().getAt(e.path);
          path.removeAt(e.vertex);
          if(path.length < 3) {
            overlay.deletePolygon(polygon);
          }
        }
        overlay.selectPolygon(polygon);
      });
      overlay.selectPolygon(polygon);
    });

    google.maps.event.addListener(map, "click", function(e) {
      overlay.deselectPolygon();
    });
  }

  // handleClick() {
  //   console.log("CLICK");
  //   console.log(this);
  //   this.setState({visibility: false});
  //   this.setDrawingTools(this.props.map);
  // }

  render() {
    return false;
    // return (
    //   <div>
    //     { this.state.visibility ? <button id="draw-button" onClick={this.handleClick}>DRAW</button> : <div></div> }
    //   </div>
    // )
  }
}
