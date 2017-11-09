import React, { Component } from 'react';

const polygonOptions = {
  strokeWeight: 0,
  fillOpacity: 0.45,
  editable: true,
  zIndex: 1
}

export class PolygonTools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      polygon: this.props.polygon,
      polygonListener: [],
      mapListener: [],
      isSelected: []
    }
  }

  // Before the component mounts, set the polygon and add the listeners
  componentWillMount() {
      for(var i=0;i<this.state.polygon.polygons.length;++i){
          this.state.polygonListener.push(null);
          this.state.mapListener.push(null);
          this.state.isSelected.push(false);
      }
    this.selectPolygon();
    let that = this;
    for(var i=0;i<this.state.polygon.polygons.length;++i){
        if(this.state.polygonListener[i] == null) {
          let polygonListener = google.maps.event.addListener(this.state.polygon.polygons[i], "click", function(e) {
            // When the user clicks on a node, that node will be deleted from the polygon.
            if(e.vertex != null) {
              let path = that.state.polygon.polygons[i].getPaths().getAt(e.path);
              path.removeAt(e.vertex);
              if(path.length < 3) {
                that.deletePolygon();
              }
            }
            if(that.state.polygon.polygons[i]) {
              that.selectPolygon();
            }
          });
          that.state.polygonListener[i]=polygonListener;
        }

        if(this.state.mapListener[i] == null) {
          let mapListener = google.maps.event.addListener(this.props.map, "click", function(e) {
            that.deselectPolygon();
          });
          that.state.mapListener[i]=mapListener;
        }
    }



  }

  componentWillUnmount() {
    // Before the component unmounts, "deselect" the polygon by making in uneditable

    for(var i=0;i<this.state.polygon.polygons.length;++i){
        if(this.state.polygon.polygons[i]!=null) {
            this.state.polygon.polygons[i].setEditable(false);
        }
    }
    this.removeListeners();
    //not sure if this is needed.
    //this.props.setPolygon(this.state.polygon);
  }

  removeListeners() {
    // Remove listeners
    for(var i=0;i<this.state.polygon.polygons.length;++i){
        if(this.state.polygonListener[i] != null) {
          google.maps.event.removeListener(this.state.polygonListener[i]);
        }
        if(this.state.mapListener[i] != null) {
          google.maps.event.removeListener(this.state.mapListener[i]);
        }
    }
  }

  // not sure if this is needed anywhere...
  setPolygon(map, coords) {
    let newPolygonOptions = polygonOptions;
    newPolygonOptions.paths = coords;
    let polygon = new google.maps.Polygon(newPolygonOptions);
    polygon.setMap(map);
    this.state.polygon = polygon;
  }

  selectPolygon() {
    this.deselectPolygon();
    for(var i=0;i<this.state.polygon.polygons.length;++i){
        if(this.state.polygon.polygons[i]!=null){
            this.state.polygon.polygons[i].setEditable(true);
            this.state.isSelected[i]=true;
        }
    }
  }

  deselectPolygon() {
      for(var i=0;i<this.state.polygon.polygons.length;++i){
          if(this.state.isSelected[i]!=null){
              this.state.polygon.polygons[i].setEditable(false);
          }
          this.state.isSelected[i]=false;
      }
  }

  deletePolygon() {
    this.removeListeners();
    this.setState({polygonListener: null, mapListener: null});
    // When the polygon is deleted, the user can draw a polygon again (limit to one)
    if(this.state.polygon != null) {
      this.state.polygon.setMap(null);
      this.setState({polygon: null});
      // Remove polygon via the callback function
      this.props.setPolygon(null);
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
      drawingTools: this,
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
      google.maps.event.removeListener(this.state.polygonListener);
    }
    if(this.state.drawingManager) {
      this.state.drawingManager.setMap(null);
    }
    if(this.state.mapListener) {
      google.maps.event.removeListener(this.state.mapListener);
    }
  }

  selectPolygon() {
    this.deselectPolygon();
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
      google.maps.event.removeListener(this.state.polygonListener);
      this.setState({polygonListener: null});
    }
    if(this.state.polygon != null) {
      this.state.polygon.setMap(null);
      this.setState({polygon: null});
    }
  }

  resetDrawingTools() {
    if(this.state.drawingManager != null) {
      this.state.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      this.state.drawingManager.setOptions({
        drawingControl: true
      });
    }
  }

  setDrawingTools(map) {
    const drawingToolsOptions = {
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT,
        drawingModes: ["polygon"]
      },
      polygonOptions: polygonOptions,
      map: map
    }

    let drawingTools = this.state.drawingTools;
    var drawingManager = new google.maps.drawing.DrawingManager(drawingToolsOptions);
    this.setState({drawingManager: drawingManager});

    google.maps.event.addListener(drawingManager, "polygoncomplete", function(polygon) {
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
            drawingTools.deletePolygon();
          }
        }
        drawingTools.selectPolygon();
      });
      drawingTools.setState({polygonListener: polygonListener});

      drawingTools.selectPolygon();
    });

    if(this.state.mapListener == null) {
      let mapListener = google.maps.event.addListener(map, "click", function(e) {
        drawingTools.deselectPolygon();
      });
      drawingTools.setState({mapListener: mapListener});
    }
  }

  render() {
    return null
  }
}
