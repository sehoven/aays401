import React, { Component } from 'react';
import GoogleMap from 'google-map-react';
import PropTypes from 'prop-types';

export default class Overlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDrawing: this.props.isDrawing
    }
    this.handleClick = this.handleClick.bind(this);
    this.stopDrawing = this.stopDrawing.bind(this);
  }

  handleClick() {
    this.setState({isDrawing: true});
    this.props.changeFocus();
    this.props.changeIsDrawing();
  }

  stopDrawing() {
    this.drawingTools.removeDrawingTools();
    this.setState({isDrawing: false});
  }

  render() {
    let drawButton = <button id="draw-button" onClick={this.handleClick}>DRAW</button>;
    return (
      <div>
        { this.state.isDrawing ? <DrawingTools ref={instance => {this.drawingTools = instance;}} map={this.props.map} maps={this.props.maps}/> : drawButton }
      </div>
    )
  }
}

// This component will be used to display the drawing tools and draw a polygon on the map
export class DrawingTools extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPolygon: null,
      drawingTools: this,
      drawingManager: null,
      polygonListener: null
    }

    this.selectPolygon = this.selectPolygon.bind(this);
    this.deselectPolygon = this.deselectPolygon.bind(this);
    this.deletePolygon = this.deletePolygon.bind(this);
  }

  componentDidMount() {
    this.setDrawingTools(this.props.map);
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
  }

  setDrawingTools(map) {
    // Keep reference to DrawingTools so we can call functions inside event listeners on map
    let drawingTools = this.state.drawingTools;

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

      let polygonListener = google.maps.event.addListener(polygon, "click", function(e) {
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

    google.maps.event.addListener(map, "click", function(e) {
      drawingTools.deselectPolygon();
    });
  }

  render() {
    return null;
  }
}

// This component will be used to render a polygon on the map given an array of points
export class Polygon extends Component {
  constructor(props) {
    super(props);

    this.renderPolygon = this.renderPolygon.bind(this);
  }

  renderPolygon(map, coords) {
    let polygon = new google.maps.Polygon({
      paths: coords,
      strokeWeight: 0,
      fillOpacity: 0.45
    });
    polygon.setMap(map);
  }

  render() {
    return null;
  }
}
