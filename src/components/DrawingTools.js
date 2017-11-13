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
    this.state = {
      polygons: this.props.polygons,
      polygonListeners: [],
      mapListener: null,
      isSelected: []
    }

    if(this.props.polyNum == 0) {
      polygonOptions.fillColor = '#000000';
      polygonOptions.fillOpacity = 0.20;
    } else {
      polygonOptions.fillColor = randomColor();
      polygonOptions.fillOpacity = 0.45;
    }
  }

  // Before the component mounts, set the polygon and add the listeners
  componentWillMount() {
    let that = this;

    for(var i = 0; i < this.props.polygons.size(); ++i) {
      this.state.polygonListeners.push(null);
      this.state.isSelected.push(false);
    }

    for(var i = 0; i < this.props.polygons.size(); ++i) {
      if(this.state.polygonListeners[i] == null) {
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
          if(that.state.isSelected[index]) {
            that.deselectPolygon(index);
          } else {
            that.selectPolygon(index);
          }
        });
        this.state.polygonListeners[i] = polygonListener;
      }
    }
    if(this.state.mapListener == null) {
      let mapListener = this.props.maps.event.addListener(this.props.map, "click", function(e) {
       that.deselectAllPolygons();
      });
      this.setState({mapListener: mapListener});
    }
  }

  componentWillUnmount() {
    // Before the component unmounts, "deselect" the polygon by making in uneditable
    this.deselectAllPolygons();
    this.removeAllListeners();
  }

  removeAllListeners() {
    // Remove listeners
    for(var i = 0; i < this.state.polygonListeners.length; ++i){
      this.removeListener(i);
    }
    if(this.state.mapListener != null) {
      this.props.maps.event.removeListener(this.state.mapListener);
      this.setState({mapListener: null});
    }
  }

  removeListener(i) {
    if(i > -1 && i < this.state.polygonListeners.length) {
      if(this.state.polygonListeners[i] != null) {
        this.props.maps.event.removeListener(this.state.polygonListeners[i]);
        this.state.polygonListeners.splice(i, 1);
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
      // TODO Bad practice to set state without setState but it doesn't really
      // matter here because there's nothing to re-render
      this.state.isSelected[i] = true;
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
    this.state.isSelected[i] = false;
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

    this.state = {
      polygon: null,
      isSelected: false,
      drawingManager: null,
      polygonListener: null,
      mapListener: null
    }

  }

  componentDidMount() {
    this.setDrawingTools(this.props.map);
  }

  componentWillUnmount() {
    this.props.setPolygon(this.state.polygon);
    this.removeDrawingTools();
  }

  removeDrawingTools() {
    // Basically deselecting the polygon, but we don't want to set the state
    if(this.state.polygon) {
      this.state.polygon.setEditable(false);
    }
    if(this.state.polygonListener) {
      this.props.maps.event.removeListener(this.state.polygonListener);
    }
    if(this.state.drawingManager) {
      this.state.drawingManager.setMap(null);
    }
    if(this.state.mapListener) {
      this.props.maps.event.removeListener(this.state.mapListener);
    }
  }

  selectPolygon() {
    if(this.state.polygon) {
      this.state.polygon.setEditable(true);
      this.setState({isSelected: true});
    }
  }

  deselectPolygon() {
    if(this.state.isSelected) {
      if(this.state.polygon != null) {
        this.state.polygon.setEditable(false);
      }
      this.setState({isSelected: false});
    }
  }

  deletePolygon() {
    // When the polygon is deleted, the user can draw a polygon again (limit to one)
    this.resetDrawingTools();
    if(this.state.polygonListener) {
      this.props.maps.event.removeListener(this.state.polygonListener);
      this.setState({polygonListener: null});
    }
    if(this.state.polygon != null) {
      this.state.polygon.setMap(null);
      this.setState({polygon: null, isSelected: false});
    }
  }

  resetDrawingTools() {
    if(this.state.drawingManager != null) {
      this.state.drawingManager.setDrawingMode(this.props.maps.drawing.OverlayType.POLYGON);
      this.state.drawingManager.setOptions({
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
    var drawingManager = new this.props.maps.drawing.DrawingManager(drawingToolsOptions);
    this.setState({drawingManager: drawingManager});

    this.props.maps.event.addListener(drawingManager, "polygoncomplete", function(polygon) {
      // After drawing, switch to non-drawing mode and remove drawing controls to limit to one polygon.
      drawingManager.setDrawingMode(null);
      drawingManager.setOptions({
        drawingControl: false
      });
      that.setState({polygon: polygon, isSelected: true});

      let polygonListener = that.props.maps.event.addListener(polygon, "click", function(e) {
        // When the user clicks on a node, that node will be deleted from the polygon.
        if(e.vertex != null) {
          let path = polygon.getPaths().getAt(e.path);
          path.removeAt(e.vertex);
          if(path.length < 3) {
            that.deletePolygon();
          }
        }
        if(that.state.isSelected) {
          that.deselectPolygon();
        } else {
          that.selectPolygon();
        }
      });
      that.setState({polygonListener: polygonListener});

      that.selectPolygon();
    });

    if(this.state.mapListener == null) {
     let mapListener = this.props.maps.event.addListener(map, "click", function(e) {
       that.deselectPolygon();
     });
      that.setState({mapListener: mapListener});
    }
  }

  render() {
    return null
  }
}
