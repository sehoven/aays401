import React, { Component } from 'react';
import DrawingTools, { PolygonTools } from './DrawingTools.js';
const HTTPService = require('./HTTPService.js');

class Overlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawing: false
    }
  }

  toggleIsDrawing(callback) {
    this.setState({isDrawing: !this.state.isDrawing});
    if(this.props.toggleDrawingTools) {
      this.props.toggleDrawingTools(callback);
    } else if(callback != null) {
      // also add check to make sure callback is a function?
      callback();
    }
  }

  drawClick() {
    let callback;
    if(this.props.finishClickCallback) {
      callback = () => { this.props.drawClickCallback(); };
    }
    this.toggleIsDrawing(callback);
  }

  clearClick() {
    if(this.props.clearClickCallback) {
      this.props.clearClickCallback();
    }
  }

  finishClick() {
    let callback;
    if(this.props.finishClickCallback) {
      callback = () => { this.props.finishClickCallback(); };
    }
    this.toggleIsDrawing(callback);
  }

  cancelClick() {
    let callback;
    if(this.props.cancelClickCallback) {
      callback = () => { this.props.cancelClickCallback(); };
    }
    this.toggleIsDrawing(callback);
  }

  render() {
    if (!this.props.active) return null;

    let drawButton = <button id="draw-button" onClick={this.drawClick.bind(this)}>DRAW</button>;
    let clearButton = <button id="clear-button" onClick={this.clearClick.bind(this)}>CLEAR</button>;
    let cancelButton = <button id="cancel-draw-button" onClick={this.cancelClick.bind(this)}>CANCEL</button>;
    let finishButton = <button id="finish-draw-button" onClick={this.finishClick.bind(this)}>FINISH</button>;

    return (
      <div>
        { this.state.isDrawing ? null : drawButton }
        { this.state.isDrawing || !this.props.canClear ? null : clearButton }
        { this.state.isDrawing ? cancelButton : null }
        { this.state.isDrawing ? finishButton : null }
      </div>
    )
  }
}

// This component will be used to trigger drawing tools
export default class OverlayContainer extends Component {
  constructor(props) {
    super(props);

    // dataReady is true when the unit count data is loaded into overlay.js
    // data refers to the unit count data
    this.state = {
      isDrawing: false,
      polygon: null,
      dataReady: false,
      data: null,
      url:null
    }
    this.setImgUrl = this.setImgUrl.bind(this);
  }

  toggleDrawingTools(callback) {
    this.setState({isDrawing: !this.state.isDrawing}, callback);
  }

  drawClickCallback() { }

  clearClickCallback() {
    if(this.state.polygon) {
      this.state.polygon.setMap(null);
    }
    this.setPolygon(null);
  }

  convertToLatLng(polygon) {
    let latLngs;
    if(polygon != null) {
      latLngs = [];
      let path = polygon.getPath();
      for(let j = 0; j < path.getLength(); ++j) {
        let vertex = path.getAt(j);
        latLngs.push({
          lat: vertex.lat(),
          lng: vertex.lng()
        });
      }
    }
    return latLngs;
  }

  finishClickCallback() {
    let that = this;
    let polygon = this.convertToLatLng(this.state.polygon);

    if(polygon) {
      HTTPService.countPolyResidences(
        { points: polygon, center:  0.1, radius: 0.1 }
      ).then(function(json){
        that.setState({dataReady: true, data: json});
      });
       this.setImgUrl(polygon);
    }
  }

  cancelClickCallback() { }

  setPolygon(polygon) {
    this.setState({polygon: polygon});

    // If there is no longer a polygon, clear the unit count data
    if(polygon == null) {
      this.setState({dataReady: false, data: null});
      this.setState({dataReady:null, url:null});
    }
  }

  setImgUrl(polygon){
      let url="https://maps.googleapis.com/maps/api/staticmap?&size=1000x1000&path=color:0x00000000|weight:5|fillcolor:0x00BDBDBD";
      polygon.forEach(function(position){
          url += "|"+position["lat"]+ ","+ position["lng"];
      });
      this.setState({url:url});
    }
  render() {
    let image = <img className="image" src= {this.state.url}/>
    return (
      <div className={ this.props.active && "nav-panel"}>
        <Overlay
          active={this.props.active}
          toggleDrawingTools={this.toggleDrawingTools.bind(this)}
          drawClickCallback={this.drawClickCallback.bind(this)}
          clearClickCallback={this.clearClickCallback.bind(this)}
          canClear={ (this.state.polygon != null) }
          finishClickCallback={this.finishClickCallback.bind(this)}
          cancelClickCallback={this.cancelClickCallback.bind(this)} />
        { this.state.isDrawing && this.state.polygon != null ?
          <PolygonTools map={this.props.map}
                        maps={this.props.maps}
                        polygon={this.state.polygon}
                        setPolygon={(polygon) => this.setPolygon(polygon)} /> : null
        }
        { this.state.isDrawing && this.state.polygon == null ?
          <DrawingTools map={this.props.map}
                        maps={this.props.maps}
                        setPolygon={(polygon) => this.setPolygon(polygon)} /> : null
        }
        { this.props.active &&
          <div>
            <ol className="show-number">
              <li>Residences: {this.state.dataReady ? this.state.data["residential"]:"?"}</li>
              <li>Industrial: {this.state.dataReady ? this.state.data["industrial"]:"?"}</li>
              <li>Commercial: {this.state.dataReady ? this.state.data["commercial"]:"?"}</li>
              <li>Urban: {this.state.dataReady ? this.state.data["urban service"]:"?"}</li>
              <li>Other: {this.state.dataReady ? this.state.data["other"]:"?"}</li>
            </ol>

            { this.state.url !=null ?
              <a href={this.state.url} download="map">{image}</a> : null
            }
          </div>
        }
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
      return this.convertToLatLng(polygon);
    }
    return null;
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

  convertToLatLng(polygon) {
    let latLngs = [];
    let path = polygon.getPath();
    for(let j = 0; j < path.getLength(); ++j) {
      let vertex = path.getAt(j);
      latLngs.push({
        lat: vertex.lat(),
        lng: vertex.lng()
      });
    }

    return latLngs;
  }

  // Converts the whole array of polygons to objects with the lat/lng pairs for each point
  convertAllToLatLng() {
    let allPolygons = [];
    for(let i = 0; i < this.polygons.length; ++i) {
      allPolygons.push(convertToLatLng(this.polygons[i]));
    }

    return allPolygons;
  }
}
