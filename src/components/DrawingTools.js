import React, { Component } from 'react';
var randomColor = require('randomcolor');

var polygonOptions = {
  strokeWeight: 0.2,
  strokeColor: '#000000',
  fillOpacity: 0.50,
  fillColor: '#000000',
  editable: true,
  zIndex: 1
}

// This component will be used to display the drawing tools and draw a polygon on the map
export default class DrawingTools extends Component {
  constructor(props) {
    super(props);

    this.polygon = null;
    this.listener = null;
    this.drawingManager = null;

    if (this.props.polyNum == 0){
      polygonOptions.fillOpacity = 0.1;
      polygonOptions.fillColor = '#000000';
      polygonOptions.strokeWeight = 1;
    } else {
      polygonOptions.fillColor = randomColor({ luminosity: 'bright' });
      polygonOptions.fillOpacity = 0.5;
      polygonOptions.strokeWeight = 0.2;
    }
    polygonOptions.strokeColor = polygonOptions.fillColor;
  }

  componentDidMount() {
    this.props.flagCallback(false);
    this.setDrawingTools(this.props.map);
  }

  componentWillUpdate() {
    if(this.props.polyNum == 0){
      polygonOptions.fillColor = '#000000';
      polygonOptions.fillOpacity = 0.20;
    } else {
      polygonOptions.fillColor = randomColor({ luminosity: 'bright' });
      polygonOptions.fillOpacity = 0.5;
    }
    polygonOptions.strokeColor = polygonOptions.fillColor;
  }

  componentWillUnmount() {
    this.props.addPolygon(this.polygon, this.completedFlag);
    this.props.maps.event.removeListener(this.listener);
    this.removeDrawingTools();
  }

  removeDrawingTools() {
    if(this.drawingManager) {
      this.drawingManager.setMap(null);
    }
  }

  resetDrawingTools() {
    if(this.drawingManager != null) {
      this.drawingManager.setDrawingMode(this.props.maps.drawing.OverlayType.POLYGON);
      this.drawingManager.setOptions({
        drawingControl: true
      });
    }
  }

  setDrawingTools(map) {
    const drawingToolsOptions = {
      drawingMode: this.props.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: this.props.maps.ControlPosition.TOP_RIGHT,
        drawingModes: ["polygon"]
      },
      polygonOptions: polygonOptions,
      map: map
    }

    let that = this;
    this.drawingManager = new this.props.maps.drawing.DrawingManager(drawingToolsOptions);
    this.props.maps.event.addListener(that.drawingManager, "polygoncomplete", function(polygon) {
      // After drawing, switch to non-drawing mode and remove drawing controls to limit to one polygon.
      that.drawingManager.setDrawingMode(null);
      that.drawingManager.setOptions({
        drawingControl: false
      });

      that.props.flagCallback(true);

      that.listener = that.props.maps.event.addListener(polygon, "click", function(e) {
        if(e.vertex != null) {
          let path = this.getPaths().getAt(e.path);
          path.removeAt(e.vertex);
          if(path.length < 3) {
            this.setMap(null);
          }
        }
      });
      that.polygon = polygon;
    });
  }

  render() {
    return null
  }
}
