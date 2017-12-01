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

  // Before the component mounts, set the polygon and add the listeners
  componentWillMount() {
    let that = this;

    for(var i = 0; i < this.props.polygons.size(); ++i) {
      let dataItem = {
        polygon: this.props.polygons.getAt(i).polygon,
        polygonListener: null,
        isSelected: false
      }
      this.data.push(dataItem);
    }

    for(var i = 0; i < this.data.length; ++i) {
      if(this.data[i].polygonListener == null) {
        let data = this.data[i];
        let polygonListener = this.props.maps.event.addListener(data.polygon, "click", function(e) {
          // When the user clicks on a node, that node will be deleted from the polygon.
          if(e.vertex != null) {
            let path = data.polygon.getPaths().getAt(e.path);
            path.removeAt(e.vertex);
            if(path.length < 3) {
              that.deleteOnePolygon(data.polygon);
            }
          } else {
            if(data.isSelected) {
              that.deselectOnePolygon(data.polygon);
            } else {
              that.selectOnePolygon(data.polygon);
            }
          }
        });

        data.polygonListener = polygonListener;
      }
    }

    if(this.mapListener == null) {
      this.mapListener = this.props.maps.event.addListener(this.props.map, "click", function(e) {
        that.deselectAllPolygons();
      });
    }
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
    this.props.setPolygonArray(polygons);
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
    for(let i = 0; i < this.data.length; ++i) {
      this.props.maps.event.removeListener(this.data[i].polygonListener);
      this.data[i].polygonListener = null;
    }
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

  selectPolygon(dataItem) {
    if(dataItem != null && dataItem.polygon != null) {
      dataItem.polygon.setEditable(true);
      dataItem.isSelected = true;
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

  deselectPolygon(dataItem) {
    if(dataItem != null && dataItem.polygon != null) {
      dataItem.polygon.setEditable(false);
      dataItem.isSelected = false;
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
        this.props.maps.event.removeListener(removed[0].polygonListener);
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
    this.isSelected = false;
    this.drawingManager = null;
    this.polygonListener = null;
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
    this.props.getPolygon(this.polygon);
    //this.props.addPolygon(this.polygon);
    this.removeDrawingTools();
  }

  removeDrawingTools() {
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
        } else {
          if(that.isSelected) {
            that.deselectPolygon();
          } else {
            that.selectPolygon();
          }
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
