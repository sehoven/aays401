import React, { Component } from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import DrawingTools, { PolygonTools } from './DrawingTools.js';
const HTTPService = require('./HTTPService.js');
const notificationTimer = 2000;

export class Overlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawing: false,
      notification: null,
      banner: null
    }
  }

  toggleIsDrawing(callback) {
    let newIsDrawing = !this.state.isDrawing;
    this.setState({isDrawing: newIsDrawing});
    if(this.props.toggleDrawingTools) {
      this.props.toggleDrawingTools(newIsDrawing, callback);
    } else if(callback != null) {
      callback();
    }
  }

  setIsDrawing(value, callback) {
    let newIsDrawing = !this.state.isDrawing;
    this.setState({isDrawing: value});
    if(this.props.toggleDrawingTools) {
      this.props.toggleDrawingTools(newIsDrawing, callback);
    } else if(callback != null) {
      callback();
    }
  }

  drawClick() {
    let callback;

    if(this.props.drawClickCallback) {
      callback = () => { this.props.drawClickCallback(); };
    }
    this.toggleIsDrawing(callback);
    if(this.state.notification==null){
      this.state.notification = 'draw';
    }

    this.createNotification(this.state.notification);
    this.state.notification = 'nothing';
  }

  clearClick() {
    let polycount = 0;

    if(this.props.clearClickCallback) {
      polycount = this.props.clearClickCallback();
    }
    if(polycount > 0){
      this.state.notification = 'clear';
    }
    this.createNotification(this.state.notification);
    this.state.notification = 'nothing';
  }

  finishClick() {
    let callback;
    if(this.props.finishClickCallback) {
      callback = () => { this.props.finishClickCallback(); };
    }
    this.toggleIsDrawing(callback);

    this.state.notification = 'finish';
    this.createNotification(this.state.notification);
    this.state.notification = 'nothing';
  }

  cancelClick() {
    let callback;
    if(this.props.cancelClickCallback) {
      callback = () => { this.props.cancelClickCallback(); };
    }
    this.toggleIsDrawing(callback);

    this.state.notification = 'cancel';
    this.createNotification(this.state.notification);
    this.state.notification = 'nothing';
  }

  addClick(){
    let callback;
    if(this.props.addClickCallback) {
      callback = () => { this.props.addClickCallback();};
    }
    this.setIsDrawing(true, callback);

    this.state.notification = 'inner';
    this.createNotification(this.state.notification);
    this.state.notification = 'nothing';
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
        //case 'cancel':
        // this.state.banner = NotificationManager.warning('Removed Last Drawn Polygon','' ,notificationTimer);
        //  break;
        case 'clear':
          this.state.banner = NotificationManager.warning('Cleared Polygon','', notificationTimer);
          break;
        case 'error':
          this.state.banner = NotificationManager.error('Error message', 'Click me!', notificationTimer, () => {
            alert('callback');
          })
          break;
      };
  };

  render() {

    if (!this.props.active) return null;

    let drawButton = <button id="draw-button" onClick={this.drawClick.bind(this)}>DRAW</button>;
    let clearButton = <button id="clear-button" onClick={this.clearClick.bind(this)}>CLEAR</button>;
    let cancelButton = <button id="cancel-draw-button" onClick={this.cancelClick.bind(this)}>RETURN</button>;
    let finishButton = <button id="finish-draw-button" onClick={this.finishClick.bind(this)}>FINISH</button>;
    let addButton = <button id="add-draw-button" onClick={this.addClick.bind(this)}>ADD</button>;

    return (
      <div>
        {this.state.banner}
        <NotificationContainer/>
        { this.state.isDrawing ? null : drawButton }
        { this.state.isDrawing || !this.props.canClear ? null : clearButton }
        { this.state.isDrawing ? cancelButton : null }
        { this.state.isDrawing ? finishButton : null }
        { this.state.isDrawing ? addButton : null }
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
      polygons: new PolygonArray(),
      polyNum: 0,
      dataReady: false,
      data:[],
      url:[]
    }
  }

  toggleDrawingTools(value, callback) {
    this.setState({isDrawing: value}, callback);
  }

  addFirstPolygon(polygon) {
    let polygonList = this.state.polygons;
    if(polygonList != null) {
      polygonList.clear();
    }
    polygonList.push(polygon);
    this.setState({ polygons: polygonList, data: [], url: [], polyNum: 0},
      () => {
        this.addPolygonData(polygon);
      }
    );
  }

  drawClickCallback() { }

  clearClickCallback() {
    let polycount = this.state.polygons.size();
    let polygonArray = this.state.polygons;
    polygonArray.pop();
    this.setState((prevState) => ({
      polygons: polygonArray,
      url: [...prevState.url.slice(0,this.state.url.length - 1)],
      data: [...prevState.data.slice(0,this.state.data.length - 1)]
    }));

    return polycount;
  }

  finishClickCallback() { }

  cancelClickCallback() { }

  addClickCallback() {
    this.setState({isDrawing: true});
    return this.state.polygons.size() != this.state.polyNum;
  }

  addPolygonData(polygon) {
    if(polygon != null) {
      polygon = this.state.polygons.convertToLatLng(polygon);

      let that = this;
      HTTPService.countPolyResidences(
        { points: polygon, center:  0.1, radius: 0.1 }
      ).then(function(json){
        that.setState(prevState => ({
          dataReady: true,
          data: [...prevState.data, json],
          polyNum: ++prevState.polyNum
        }));
      });
      that.setImgUrl(polygon);
    }
  }

  setPolygon(polygon) {
    if(polygon != null) {
      let polygonArray = this.state.polygons;
      polygonArray.push(polygon);
      this.setState({polygons: polygonArray});
      this.addPolygonData(polygon);
    }
  }

  setImgUrl(polygon){
    if(polygon != null) {
      let url="https://maps.googleapis.com/maps/api/staticmap?&size=1000x1000&path=color:0x00000000|weight:5|fillcolor:0x00BDBDBD";
      polygon.forEach(function(position) {
        url += "|"+position["lat"]+ ","+ position["lng"];
      });
      this.setState(prevState => ({
        url: [...prevState.url, url]
      }));
    }
  }

  render() {
    return (
      <div className={this.props.active && "nav-panel"}>
        <Overlay
          active={this.props.active}
          toggleDrawingTools={this.toggleDrawingTools.bind(this)}
          drawClickCallback={this.drawClickCallback.bind(this)}
          clearClickCallback={this.clearClickCallback.bind(this)}
          canClear={ (this.state.polygons != null) }
          finishClickCallback={this.finishClickCallback.bind(this)}
          addClickCallback = {this.addClickCallback.bind(this)}
          cancelClickCallback={this.cancelClickCallback.bind(this)} />
        { this.state.isDrawing && this.state.polygons.size() > 0 ?
          <PolygonTools map={this.props.map}
                        maps={this.props.maps}
                        polygons={this.state.polygons}
                        polyNum = {this.state.polyNum} /> : null
        }
        { this.state.isDrawing ?
          <DrawingTools map={this.props.map}
                        maps={this.props.maps}
                        setPolygon={(polygon) => this.setPolygon(polygon)} /> : null
        }
        { this.props.active &&
          <div id="navbar-list">
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
                <a href={this.state.url[i]} download="map">{<img className="image" src= {this.state.url[i]}/>}</a>

              </div>
            ): null}
          </div>
        }
      </div>
    )
  }
}

// Class to handle the polygon objects visible on the map.
class PolygonArray {
  constructor(...x) {
    this.arr = [...x];
  }

  push(polygon) {
    if(polygon != null) {
      this.arr.push(polygon);
    }
  }

  pop() {
    let popped = this.arr.pop();
    if(popped != null) {
      popped.setMap(null);
    }
    return popped;
  }

  remove(i) {
    if(i > 0 && i < this.arr.length) {
      let removed = this.arr.splice(i, 1);
      if(removed[0] != null) {
        removed[0].setMap(null);
      }
    }
  }

  getAt(i) {
    return this.arr[i];
  }

  clear() {
    while(this.arr.length) {
      this.pop();
    }
  }

  size() {
    return this.arr.length;
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
    for(let i = 0; i < this.arr.length; ++i) {
      allPolygons.push(convertToLatLng(this.arr[i]));
    }

    return allPolygons;
  }
}
