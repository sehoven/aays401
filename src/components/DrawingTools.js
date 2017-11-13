import React, { Component } from 'react';
var randomColor = require('randomcolor');

var polygonOptions = {
  strokeWeight: 0.2,
  strokeColor: '#000000',
  fillOpacity: 0.20,
  fillColor: '#000000',
  editable: true,
  zIndex: 1
}

export class PolygonTools extends Component {
  constructor(props) {
    super(props);

    this.polygons = this.props.polygons;
    this.polygonListeners = [];
    this.mapListener = null;
    this.isSelected = [];

    if(this.props.polyNum == 0) {
      polygonOptions.fillColor = '#000000';
      polygonOptions.fillOpacity = 0.20;
    } else {
      polygonOptions.fillColor = randomColor();
      polygonOptions.fillOpacity = 0.45;
    }

    // TODO props should not be modified (i.e. this.props.polygons)
  }

  // Before the component mounts, set the polygon and add the listeners
  componentWillMount() {
    let that = this;

    for(var i = 0; i < this.props.polygons.size(); ++i) {
      this.polygonListeners.push(null);
      this.isSelected.push(false);
    }

    for(var i = 0; i < this.props.polygons.size(); ++i) {
      if(this.polygonListeners[i] == null) {
        let index = i;
        let polygon = this.props.polygons.getAt(index);
        let polygonListener = this.props.maps.event.addListener(polygon, "click", function(e) {
          // When the user clicks on a node, that node will be deleted from the polygon.
          if(e.vertex != null) {
            let path = polygon.getPaths().getAt(e.path);
            path.removeAt(e.vertex);
            if(path.length < 3) {
              that.deletePolygon(index);
            }
          }
          if(that.isSelected[index]) {
            that.deselectPolygon(index);
          } else {
            that.selectPolygon(index);
          }
        });
        this.polygonListeners[i] = polygonListener;
      }
    }

    if(this.mapListener == null) {
      this.mapListener = this.props.maps.event.addListener(this.props.map, "click", function(e) {
        that.deselectAllPolygons();
      });
    }
  }

  componentWillUnmount() {
    // Before the component unmounts, "deselect" the polygon by making in uneditable
    this.deselectAllPolygons();
    this.removeAllListeners();
  }

  removeAllListeners() {
    // Remove listeners
    for(var i = 0; i < this.polygonListeners.length; ++i){
      this.removeListener(i);
    }
    if(this.mapListener != null) {
      this.props.maps.event.removeListener(this.mapListener);
      this.mapListener = null;
    }
  }

  removeListener(i) {
    if(i > -1 && i < this.polygonListeners.length) {
      if(this.polygonListeners[i] != null) {
        this.props.maps.event.removeListener(this.polygonListeners[i]);
        this.polygonListeners.splice(i, 1);
      }
    }
  }

  selectAllPolygons() {
    for(let i = 0; i < this.props.polygons.size(); ++i) {
      this.selectPolygon(i);
    }
  }

  selectPolygon(i) {
    if(this.props.polygons.getAt(i) != null){
      this.props.polygons.getAt(i).setEditable(true);
      this.isSelected[i] = true;
    }
  }

  deselectAllPolygons() {
    for(let i = 0; i < this.props.polygons.size(); ++i) {
      this.deselectPolygon(i);
    }
  }

  deselectPolygon(i) {
    if(this.props.polygons.getAt(i) != null) {
      this.props.polygons.getAt(i).setEditable(false);
    }
    this.isSelected[i] = false;
  }

  deleteAllPolygons() {
    this.removeAllListeners();
  }

  deletePolygon(i) {
    this.removeListener(i);
    if(this.props.polygons.getAt(i) != null) {
      this.props.polygons.remove(i);
    }
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
    this.isSelected = false;
    this.drawingManager = null;
    this.polygonListener = null;
    this.mapListener = null;
  }

  componentDidMount() {
    this.setDrawingTools(this.props.map);
  }

  componentWillUnmount() {
    this.props.setPolygon(this.polygon);
    this.removeDrawingTools();
  }

  removeDrawingTools() {
    // Basically deselecting the polygon, but we don't want to set the state
    if(this.polygon) {
      this.polygon.setEditable(false);
    }
    if(this.polygonListener) {
      this.props.maps.event.removeListener(this.polygonListener);
    }
    if(this.drawingManager) {
      this.drawingManager.setMap(null);
    }
    if(this.mapListener) {
      this.props.maps.event.removeListener(this.mapListener);
    }
  }

  selectPolygon() {
    if(this.polygon) {
      this.polygon.setEditable(true);
      this.isSelected = true;
    }
  }

  deselectPolygon() {
    if(this.isSelected) {
      if(this.polygon != null) {
        this.polygon.setEditable(false);
      }
      this.isSelected = false;
    }
  }

  deletePolygon() {
    // When the polygon is deleted, the user can draw a polygon again (limit to one)
    this.resetDrawingTools();
    if(this.polygonListener) {
      this.props.maps.event.removeListener(this.polygonListener);
      this.polygonListener = null;
    }
    if(this.polygon != null) {
      this.polygon.setMap(null);
      this.polygon = null;
      this.isSelected = false;
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
      that.isSelected = true;

      let polygonListener = that.props.maps.event.addListener(polygon, "click", function(e) {
        // When the user clicks on a node, that node will be deleted from the polygon.
        if(e.vertex != null) {
          let path = polygon.getPaths().getAt(e.path);
          path.removeAt(e.vertex);
          if(path.length < 3) {
            that.deletePolygon();
          }
        }
        if(that.isSelected) {
          that.deselectPolygon();
        } else {
          that.selectPolygon();
        }
      });
      that.polygonListener = polygonListener;
      that.selectPolygon();
    });

    if(this.mapListener == null) {
      this.mapListener = this.props.maps.event.addListener(map, "click", function(e) {
        that.deselectPolygon();
      });
    }
  }

  render() {
    return null
  }
}
