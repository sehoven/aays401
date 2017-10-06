import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import PropTypes from 'prop-types';

export default class Overlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPolygon: null,
      overlay: this
    }
    this.polygonDrawingTools(this.props.map);
    this.selectPolygon = this.selectPolygon.bind(this);
    this.deselectPolygon = this.deselectPolygon.bind(this);
  }

  renderPolygon(map, coords) {
    var polygon = new google.maps.Polygon({
      paths: coords,
      strokeWeight: 0,
      fillOpacity: 0.45
    });
    polygon.setMap(map);
  }

  selectPolygon(polygon) {
    //console.log("Select Polygon");
    this.deselectPolygon();
    polygon.setEditable(true);
    this.setState({selectedPolygon: polygon});
  }

  deselectPolygon() {
    //console.log("Deselect Polygon");
    if(this.state.selectedPolygon) {
      this.state.selectedPolygon.setEditable(false);
      this.setState({selectedPolygon: null});
    }
  }

  polygonDrawingTools(map) {
    // Keep reference to Overlay so we can call functions inside event listeners on map
    var overlay = this.state.overlay;

    var drawingManager = new google.maps.drawing.DrawingManager({
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
        draggable: true,
        zIndex: 1
      },
      map: map
    });

    google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
      drawingManager.setDrawingMode(null);

      google.maps.event.addListener(polygon, "click", function(e) {
        if(e.vertex != null) {
          var path = polygon.getPaths().getAt(e.path);
          path.removeAt(e.vertex);
          if(path.length < 3) {
            polygon.setMap(null);
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

  render() {
    return false;
  }
}
