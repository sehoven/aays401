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

export class PolygonTools extends Component {
  constructor(props) {
    super(props);

    this.data = [];
    this.mapListener = null;
  }

  componentWillUnmount() {
    // Before unmounting, "deselect" all polygons and remove all listeners
    this.deselectAllPolygons();
    this.removeAllListeners();
    this.setPolygonArray();
  }

  setPolygonArray() {
    let polygons = [];
    for(let i = 0; i < this.data.length; ++i) {
      polygons.push(this.data[i].polygon);
    }
    this.props.setPolygonArray(polygons[0]);
  }

  findData(key, value) {
    for(let i = 0; i < this.data.length; ++i) {
      if(this.data[i][key] == value) {
        return this.data[i];
      }
    }
    return null;
  }

  removeAllListeners() {
    if(this.mapListener != null) {
      this.props.maps.event.removeListener(this.mapListener);
      this.mapListener = null;
    }
  }

  selectAllPolygons() {
    for(let i = 0; i < this.data.length; ++i) {
      this.selectPolygon(this.data[i]);
    }
  }

  selectOnePolygon(polygon) {
    let toSelect = this.findData("polygon", polygon);
    if(toSelect != null) {
      this.selectPolygon(toSelect);
    }
  }

  deselectAllPolygons() {
    for(let i = 0; i < this.data.length; ++i) {
      this.deselectPolygon(this.data[i]);
    }
  }

  deselectOnePolygon(polygon) {
    let toDeselect = this.findData("polygon", polygon);
    if(toDeselect != null) {
      this.deselectPolygon(toDeselect);
    }
  }

  deleteAllPolygons() {
    for(let i = 0; i < this.data.length; ++i) {
      this.deletePolygon(this.data[i]);
    }
  }

  deleteOnePolygon(polygon) {
    let toDelete = this.findData("polygon", polygon);
    if(toDelete != null) {
      this.deletePolygon(toDelete);
    }
  }

  deletePolygon(dataItem) {
    let index = this.data.indexOf(dataItem);
    if(index > -1) {
      let removed = this.data.splice(index, 1);
      if(removed.length > 0) {
        removed[0].polygon.setMap(null);
      }
    }
    this.setPolygonArray();
  }

  render() {
    return null;
  }
}

// This component will be used to display the drawing tools and draw a polygon on the map
export default class DrawingTools extends Component {
  constructor(props) {
    super(props);

    this.polygon = null;
    this.drawingManager = null;
    this.mapListener = null;

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
    this.props.addPolygon(this.polygon);
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
      that.polygon = polygon;
    });
  }

  render() {
    return null
  }
}
