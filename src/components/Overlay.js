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
    if(polycount > 0) {
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
      <div className="overlayContainer">
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
      outerPolygon: null,
      innerPolygons: new PolygonArray(),
      polyNum: 0,
      dataReady: false,
      data: [],
      url: []
    }
  }

  toggleDrawingTools(value, callback) {
    this.setState({isDrawing: value}, callback);
  }

  checkOuterPolygonState() {
      if(this.state.outerPolygon == null){
          return 0;
      } else {
          return 1;
      }
  }
  drawClickCallback() { }

  clearClickCallback() {
      let polycount = this.state.innerPolygons.size()+(this.checkOuterPolygonState());
      let polygon = this.state.outerPolygon;
      let polygonArray = this.state.innerPolygons;

      if(polycount > 1){
          polygonArray.getAt(polygonArray.size() - 1).remove();
          polygonArray.pop();
          polycount--;
      }
      else if(polycount == 1){
          polygon.remove();
          polygon=null;
          polycount--;
      } else {
          return polycount;
      }

      this.setState((prevState) => ({
          outerPolygon: polygon,
          innerPolygons: polygonArray,
          url: [...prevState.url.slice(0, this.state.url.length - 1)],
          data: [...prevState.data.slice(0, this.state.data.length - 1)],
          polyNum: --prevState.polyNum
      }));

      return polycount;
  }

  finishClickCallback() {
    this.updatePolygonData();
  }

  cancelClickCallback() {
    this.updatePolygonData();
  }

  addClickCallback() {
    let that = this;
    let appendPromise = new Promise(function(resolve, reject) {
      that.appendPolygonData();
      resolve();
    });
    appendPromise.then(() => {
      that.setState({isDrawing: true});
    });
  }

  appendPolygonData() {
    let that = this;
    let polygon = null;

    if(this.checkOuterPolygonState() && this.state.polyNum == 0) {
        polygon = this.state.outerPolygon.convertToLatLng();
    }
    else if(this.checkOuterPolygonState() && (this.state.polyNum < this.state.innerPolygons.size() + this.checkOuterPolygonState())){
        polygon = this.state.innerPolygons.getAt(this.state.innerPolygons.size() - 1).convertToLatLng();
    }

    if(polygon) {
      HTTPService.countPolyResidences(
        { points: polygon }
      ).then(function(json){
        that.setState(prevState => ({
          data: [...prevState.data, json],
          polyNum: ++prevState.polyNum,
          dataReady: true
        }));
        that.setImgUrl(polygon);
      });
    }
  }

  updatePolygonData() {
    let that = this;

    this.setState({url: [], data: [], polyNum: this.state.innerPolygons.size()+this.checkOuterPolygonState(), dataReady: false}, () => {

        let updateList=[];
        updateList.push(this.state.outerPolygon);
        for(let i = 0; i < this.state.innerPolygons.size(); i++){
            updateList.push(this.state.innerPolygons.getAt(i));
        }

        Promise.all(updateList.map((polygon, i) => {
        let polygonPoints = polygon.convertToLatLng();

        if(polygonPoints.length > 0) {
          HTTPService.countPolyResidences(
            { points: polygonPoints }
          ).then(function(json){
            that.setState(prevState => ({
              data: [...prevState.data, json]
            }));
            that.setImgUrl(polygonPoints);
          });
        }
      })).then(() => {
        this.setState({dataReady: true});
      });
    });
  }

  removeAllPolygons() {
      if(this.checkOuterPolygonState()) {
          this.state.outerPolygon.remove();
      }
      if(this.state.innerPolygons.size > 0) {
          for(let i = 0; i < this.state.innerPolygons.size; i++) {
              this.state.innerPolygons.getAt(i).remove();
          }
      }
      this.setState({outerPolygon: null, innerPolygons: new PolygonArray()});
  }

  addFirstPolygon(polygon) {
      if(polygon != null) {
          //need to clear all previous polygons first
          this.removeAllPolygons();
          this.setState({outerPolygon: new Polygon(polygon), innerPolygons: new PolygonArray()}, () => {
              this.updatePolygonData();
          });
      }
  }

  addPolygon(polygon) {
    if(polygon != null) {
        if(this.state.outerPolygon==null){
            this.setState({outerPolygon: new Polygon(polygon)});
        }
        else{
            let polygonArray = this.state.innerPolygons;
            polygonArray.push(new Polygon(polygon));
            this.setState({innerPolygons: polygonArray});
        }
    }
  }

  setPolygonArray(polygons) {
    if(polygons != null) {
        if(polygons.length == 1){
            this.setState({outerPolygon: new Polygon(polygons[0]), innerPolygons: new PolygonArray()});
        } else {
            let polygon = new Polygon(polygons[0]);
            let polygonArray = new PolygonArray();
            for(let i = 1; i < polygons.length; i++){
                polygonArray.push(new Polygon(polygons[i]));
            }
            this.setState({outerPolygon: polygon, innerPolygons: polygonArray});
        }
    }
  }

  setImgUrl(polygon){
    if(polygon != null) {
      let url="https://maps.googleapis.com/maps/api/staticmap?&size=1000x1000&path=color:0x00000000|weight:5|fillcolor:0x00BDBDBD";
      polygon.forEach(function(position) {
        url += "|" + position.lat + "," + position.lng;
      });
      this.setState(prevState => ({
        url: [...prevState.url, url]
      }));
    }
  }

  render() {
    if (!this.props.active) return null;
    return (
      <div className={this.props.active && "navPanel"}>
        <Overlay
          active={this.props.active}
          toggleDrawingTools={this.toggleDrawingTools.bind(this)}
          drawClickCallback={this.drawClickCallback.bind(this)}
          clearClickCallback={this.clearClickCallback.bind(this)}
          canClear={ (this.state.innerPolygons.size()+this.checkOuterPolygonState() != null) }
          finishClickCallback={this.finishClickCallback.bind(this)}
          addClickCallback = {this.addClickCallback.bind(this)}
          cancelClickCallback={this.cancelClickCallback.bind(this)} />
        { this.state.isDrawing && this.state.polyNum > 0 ?
          <PolygonTools map={this.props.map}
                        maps={this.props.maps}
                        outerPolygon={this.state.outerPolygon}
                        innerPolygons={this.state.innerPolygons}
                        setPolygonArray={(polygons) => this.setPolygonArray(polygons)} /> : null
        }
        { this.state.isDrawing ?
          <DrawingTools map={this.props.map}
                        maps={this.props.maps}
                        addPolygon={(polygon) => this.addPolygon(polygon)}
                        polyNum={this.state.polyNum} /> : null
        }
        { this.props.active &&
          <div id="navbar-list">
            {this.state.dataReady ? this.state.data.map((itemData, i)=>
              <div className="navbar-count-poly-box" key={i}>
                <div className="navbar-count-poly-title">Polygon {i}</div>
                <div className="navbar-count-poly-text">
                  <ul>
                    <li>Residences: {this.state.dataReady ? itemData["Residential"]:"?"}</li>
                    <li>Apartments: {this.state.dataReady ? itemData["Apartment"]:"?"}</li>
                    <li>Industrial: {this.state.dataReady ? itemData["Industrial"]:"?"}</li>
                    <li>Commercial: {this.state.dataReady ? itemData["Commercial"]:"?"}</li>
                    <li>Development Control Provision: {this.state.dataReady ? itemData["DirectDevelopmentControlProvision"]:"?"}</li>
                    <li>Urban: {this.state.dataReady ? itemData["UrbanService"]:"?"}</li>
                    <li>Agriculture: {this.state.dataReady ? itemData["Agriculture"]:"?"}</li>
                    <li>Other: {this.state.dataReady ? itemData["Other"]:"?"}</li>
                  </ul>
                </div>
                <a href={this.state.url[i]} download="map">{<img className="image" src= {this.state.url[i]}/>}</a>

              </div>
            ): null}
          </div>
        }
      </div>
    )
  }
}

export class Polygon {
    constructor(x){
        this.polygon = x;
    }

    convertToLatLng(){
        let latLngs = [];
        let path = this.polygon.getPath();
        for(let i = 0; i < path.getLength(); ++i) {
          let vertex = path.getAt(i);
          latLngs.push({
            lat: vertex.lat(),
            lng: vertex.lng()
          });
        }
        return latLngs;
    }
    remove(){
        let removed = this.polygon;
        if(removed != null) {
          removed.setMap(null);
        }
        return null;
    }
}

// Class to handle the polygon objects visible on the map.
export class PolygonArray {
  constructor(...x) {
    this.arr = [...x];
  }

  getAll() {
    return this.arr;
  }

  push(polygon) {
    if(polygon != null) {
      this.arr.push(polygon);
    }
  }

  pop() {
    let popped = this.arr.pop();

    return popped;
  }

  remove(i) {
    let removed;
    if(i > -1 && i < this.arr.length) {
      removed = this.arr.splice(i, 1);
      if(removed[0] != null) {
        removed[0].setMap(null);
      }
      return removed[0];
    }
    return null;
  }

  getAt(i) {
    return this.arr[i];
  }

  indexOf(polygon) {
    for(let i = 0; i < this.arr.length; ++i) {
      if(polygon == this.arr[i]) {
        return i;
      }
    }
    return -1;
  }

  clear() {
    while(this.arr.length) {
      this.pop();
    }
  }

  size() {
    return this.arr.length;
  }
}
