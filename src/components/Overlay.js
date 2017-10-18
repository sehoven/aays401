import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import PropTypes from 'prop-types';

// This component will be used to trigger drawing tools
export default class Overlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawing: false,
      polygons: new PolygonArray()
    }

    this.toggleIsDrawing = this.toggleIsDrawing.bind(this);
    this.drawClick = this.drawClick.bind(this);
    this.clearClick = this.clearClick.bind(this);
    this.finishClick = this.finishClick.bind(this);
    this.cancelClick = this.cancelClick.bind(this);
    this.stopDrawing = this.stopDrawing.bind(this);
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

  clearClick() {
    this.state.polygons.removeAll();
  }

  finishClick() {
    this.state.polygons.add(this.drawingTools.getPolygon());
    this.stopDrawing();
  }

  cancelClick() {
    this.drawingTools.deletePolygon(this.drawingTools.getPolygon());
    this.stopDrawing();
  }

  stopDrawing() {
    this.drawingTools.removeDrawingTools();
    this.toggleIsDrawing();
  }

  render() {
    let drawButton = <button id="draw-button" onClick={this.drawClick}>DRAW</button>;
    let clearButton = <button id="clear-button" onClick={this.clearClick}>CLEAR</button>;
    let cancelButton = <button id="cancel-draw-button" onClick={this.cancelClick}>CANCEL</button>;
    let finishButton = <button id="finish-draw-button" onClick={this.finishClick}>FINISH</button>;

    return (
      <div id="map-controls" className="side-panel">
        { this.state.isDrawing ?
          <DrawingTools ref={instance => {this.drawingTools = instance;}}
                        map={this.props.map}
                        maps={this.props.maps}/> : drawButton }
        { this.state.isDrawing ? null : clearButton }
        { this.state.isDrawing ? cancelButton : null }
        { this.state.isDrawing ? finishButton : null }
      </div>
    )
  }
}

// Class to handle the polygon objects visible on the map.
class PolygonArray {
  constructor() {
    this.polygons = [];
  }

  add(polygon) {
    if(polygon != null) {
      this.polygons.push(polygon);
    }
  }

  remove(polygon) {
    if(polygon != null) {
      polygon.setMap(null);
      this.polygons.remove(polygon);
    }
  }

  removeAll() {
    for(let i = 0; i < this.polygons.length; ++i) {
      this.polygons[i].setMap(null);
    }
    this.polygons = [];
  }

  // Converts the whole array of polygons to objects with the lat/lng pairs for each point
  convertToLatLng() {
    let allPolygons = [];
    for(let i = 0; i < this.polygons.length; ++i) {
      let polygon = [];
      let path = this.polygons[i].getPath();
      for(let j = 0; j < path.getLength(); ++j) {
        let vertex = path.getAt(j);
        polygon.push({
          lat: vertex.lat(),
          lng: vertex.lng()
        });
      }
      allPolygons.push(polygon);
    }

    return allPolygons;
  }
}

// This component will be used to display the drawing tools and draw a polygon on the map
export class DrawingTools extends Component {
  constructor(props) {
    super(props);

    this.state = {
      polygon: null,
      isSelected: false,
      drawingTools: this,
      drawingManager: null,
      polygonListener: null,
      mapListener: null
    }

    this.getPolygon = this.getPolygon.bind(this);
    this.selectPolygon = this.selectPolygon.bind(this);
    this.deselectPolygon = this.deselectPolygon.bind(this);
    this.deletePolygon = this.deletePolygon.bind(this);
    this.removeDrawingTools = this.removeDrawingTools.bind(this);
    this.setDrawingTools = this.setDrawingTools.bind(this);
  }

  componentDidMount() {
    this.setDrawingTools(this.props.map);
  }

  getPolygon() {
    return this.state.polygon;
  }

  selectPolygon(polygon) {
    this.deselectPolygon();
    polygon.setEditable(true);
    this.setState({isSelected: true});
  }

  deselectPolygon() {
    if(this.state.isSelected) {
      this.state.polygon.setEditable(false);
      this.setState({isSelected: false});
    }
  }

  deletePolygon(polygon) {
    // When the polygon is deleted, the user can draw a polygon again (limit to one)
    this.state.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    this.state.drawingManager.setOptions({
      drawingControl: true
    });
    polygon.setMap(null);
  }

  removeDrawingTools() {
    this.deselectPolygon();
    if(this.state.polygonListener != null) {
      google.maps.event.removeListener(this.state.polygonListener);
      this.setState({polygonListener: null});
    }
    if(this.state.drawingManager != null) {
      this.state.drawingManager.setMap(null);
      this.setState({drawingManager: null});
    }
    if(this.state.mapListener != null) {
      google.maps.event.removeListener(this.state.mapListener);
      this.setState({mapListener: null});
    }
  }

  setDrawingTools(map) {
    // Keep reference to DrawingTools so we can call functions inside event listeners on map
    let drawingTools = this.state.drawingTools;

    let drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT,
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
      // After drawing, switch to non-drawing mode and remove drawing controls to limit to one polygon.
      drawingManager.setDrawingMode(null);
      drawingManager.setOptions({
        drawingControl: false
      });
      drawingTools.setState({polygon: polygon, isSelected: true});

      let polygonListener = google.maps.event.addListener(polygon, "click", function(e) {
        // When the user clicks on a node, that node will be deleted from the polygon.
        if(e.vertex != null) {
          let path = polygon.getPaths().getAt(e.path);
          path.removeAt(e.vertex);
          if(path.length < 3) {
            drawingTools.deletePolygon(polygon);
          }
        }
        drawingTools.selectPolygon(polygon);
      });
      drawingTools.setState({polygonListener: polygonListener});

      drawingTools.selectPolygon(polygon);
    });

    let mapListener = google.maps.event.addListener(map, "click", function(e) {
      drawingTools.deselectPolygon();
    });
    drawingTools.setState({mapListener: mapListener});
  }

  render() {
    return null;
  }
}
