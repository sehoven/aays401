import React, { Component } from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import DrawingTools, { PolygonTools } from './DrawingTools.js';
const HTTPService = require('./HTTPService.js');
const notificationTimer = 2000;

class Overlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawing: false,
      notification:null,
      banner:null
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
    this.state.notification = 'draw';
    this.createNotification(this.state.notification);
  }

  clearClick() {
    if(this.props.clearClickCallback) {
      this.props.clearClickCallback();
    }
    this.state.notification = 'clear';
    this.createNotification(this.state.notification);
  }

  finishClick() {
    let callback;
    if(this.props.finishClickCallback) {
      callback = () => { this.props.finishClickCallback(); };
    }
    this.toggleIsDrawing(callback);
    this.state.notification = 'finish';
    this.createNotification(this.state.notification);
  }

  cancelClick() {
    let callback;
    if(this.props.cancelClickCallback) {
      callback = () => { this.props.cancelClickCallback(); };
    }
    this.toggleIsDrawing(callback);
    this.state.notification = 'cancel';
    this.createNotification(this.state.notification);
  }

  createNotification (type){

    switch (type) {
        case 'draw':
          this.state.banner = NotificationManager.info('Draw Outer Delivery Zone','',notificationTimer);
          break;
        case 'inner':
          this.state.banner = NotificationManager.info('Draw Individual Zones Routes','',notificationTimer);
          break;
        case 'finish':
          this.state.banner = NotificationManager.success('Delivery Route Map Generated','',notificationTimer);
          break;
        case 'cancel':
          this.state.banner = NotificationManager.warning('Removed Last Drawn Polygon','' ,notificationTimer);
          break;
        case 'clear':
          this.state.banner = NotificationManager.warning('Cleared Polygon','', notificationTimer);
          break;
        case 'error':
          this.state.banner = NotificationManager.error('Error message', 'Click me!', 2000, () => {
            alert('callback');
          })
          break;
      };
  };

  render() {

    let drawButton = <button id="draw-button" onClick={this.drawClick.bind(this)}>DRAW</button>;
    let clearButton = <button id="clear-button" onClick={this.clearClick.bind(this)}>CLEAR</button>;
    let cancelButton = <button id="cancel-draw-button" onClick={this.cancelClick.bind(this)}>CANCEL</button>;
    let finishButton = <button id="finish-draw-button" onClick={this.finishClick.bind(this)}>FINISH</button>;



    return (

      <div>
        {this.state.banner}
        <NotificationContainer/>
        { this.state.isDrawing ? null : drawButton }
        { this.state.isDrawing ? null : clearButton }
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
      polygon: new PolygonArray(),
      polyNum: 0,
      dataReady: false,
      data:[]

    }
  }

  toggleDrawingTools(callback) {
    this.setState({isDrawing: !this.state.isDrawing}, callback);
  }

  drawClickCallback() {
      this.updatePolygonData();
  }

  clearClickCallback() {
    if(this.state.polygon.polygons.length>0) {
        let i = this.state.polygon.polygons.length-1;
        this.state.polygon.polygons[i].setMap(null);
        this.state.polygon.polygons.pop();
    }
    this.updatePolygonData();
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
    this.updatePolygonData();
  }

  cancelClickCallback() {
  }

  updatePolygonData() {
      let that = this;
      this.state.data=[];
      that.state.data=[];
      if(that.state.polygon.polygons.length!=this.state.polyNum){
          that.state.polyNum=that.state.polygon.polygons.length;
          for(var i = 0;i<that.state.polygon.polygons.length;++i){
              let polygon = that.convertToLatLng(this.state.polygon.polygons[i]);
              if(polygon){
                  HTTPService.countPolyResidences(
                    { points: polygon, center:  0.1, radius: 0.1 }
                  ).then(function(json){
                      that.state.data.push(json);
                      if(that.state.data.length>0){
                          that.setState({dataReady: true});
                      }else {
                          that.setState({dataReady: false});
                      }
                  });
              }
          }
          if(that.state.polygon.polygons.length==0){
              this.state.polyNum=0;
              that.setState({dataReady: false});
              that.state.data=[];
          }
      }
  }

  setPolygon(polygon) {
  this.state.polygon.add(polygon);
  this.updatePolygonData();
  }



  render() {
    return (


      <div className="side-panel nav-panel">

        <Overlay toggleDrawingTools={this.toggleDrawingTools.bind(this)}
                 drawClickCallback={this.drawClickCallback.bind(this)}
                 clearClickCallback={this.clearClickCallback.bind(this)}
                 finishClickCallback={this.finishClickCallback.bind(this)}
                 cancelClickCallback={this.cancelClickCallback.bind(this)} />

        { this.state.isDrawing ?
          <DrawingTools map={this.props.map}
                        maps={this.props.maps}
                        setPolygon={(polygon) => this.setPolygon(polygon)} /> : null }
        { this.state.isDrawing && this.state.polygon.polygons.length >0 ?
        <PolygonTools map={this.props.map}
                        maps={this.props.maps}
                        polygon={this.state.polygon}
                        /> : null }
        {this.state.dataReady ? this.state.data.map((itemData, i)=>
        <div className="navbar-count-poly-box" key={i}>
        <div className="navbar-count-poly-title">Polygon {i}</div>
        <ul className="navbar-count-poly-text">
            <li >Residences: {this.state.dataReady ? itemData["residential"]:"?"}</li>
            <li >Industrial: {this.state.dataReady ? itemData["industrial"]:"?"}</li>
            <li >Commercial: {this.state.dataReady ? itemData["commercial"]:"?"}</li>
            <li >Urban: {this.state.dataReady ? itemData["urban service"]:"?"}</li>
            <li >Other: {this.state.dataReady ? itemData["other"]:"?"}</li>
            </ul>
        </div>
        ): null}
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
