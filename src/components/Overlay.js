import React, { Component } from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import ProgressBarView from './ProgressBar.js';
import DrawingTools, { PolygonTools } from './DrawingTools.js';
import { STATIC_STYLE, IMAGE_DIMENSIONS } from '../settings';
import SteppedProgressBar from 'patchkit-stepped-progress-bar';

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
    if(this.props.hasDeliveryZone()) {
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
      callback = () => { this.props.cancelClickCallback('cancel'); };
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

  editClick(){
      let callback;
      if(this.props.editClickCallback) {
        callback = () => { this.props.editClickCallback(); };
      }
      this.toggleIsDrawing(callback);

      this.state.notification = 'cancel';
      this.createNotification(this.state.notification);
      this.state.notification = 'nothing';
      // this.props.editClickCallback();
  }

  editUpdateClick() {
      let callback;
      if(this.props.editClickCallback) {
        callback = () => { this.props.editUpdateClickCallback();; };
      }
      this.toggleIsDrawing(callback);

      this.state.notification = 'cancel';
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

  renderButtonGroup (){
    //console.log(this.props.hasDeliveryZone());
      if(this.props.hasDeliveryZone()) {
          let buttonGroup = [
            <button id="draw-button" onClick={this.drawClick.bind(this)} style={{width: "28%"}} key="0">ADD</button>,
            <button id="clear-button" onClick={this.clearClick.bind(this)} style={{width: "28%"}} key="1">UNDO</button>,
            <button id="edit-button" onClick={this.editClick.bind(this)} style={{width: "28%"}} key="9">EDIT</button>
          ];
          return buttonGroup;
      }
      else {
          return (
              <button id="draw-button" onClick={this.drawClick.bind(this)} style={{width: "45%"}} key="0">DRAW</button>
          );
      }
  }

  renderDrawButtonGroup (){
    // let drawButtonGroup = [
    //   <button id="cancel-draw-button" onClick={this.cancelClick.bind(this)} style={{width: "45%"}} key="0">CANCEL</button>,
    //   <button id="finish-draw-button" onClick={this.finishClick.bind(this)} style={{width: "45%"}} key="1">ADD</button>,
    // ];
    // return drawButtonGroup;
      if(!this.props.hasDeliveryZone){
          let drawButtonGroup = [
            <button id="cancel-draw-button" onClick={this.cancelClick.bind(this)} style={{width: "45%"}} key="0">CANCEL</button>,
            <button id="finish-draw-button" onClick={this.finishClick.bind(this)} style={{width: "45%"}} key="1">CONFIRM</button>,
        ];
        return drawButtonGroup;
    }
    else if(this.props.isEditing){
        let drawButtonGroup = [
          <button id="cancel-draw-button" onClick={this.cancelClick.bind(this)} style={{width: "45%"}} key="0">CANCEL</button>,
          <button id="finish-draw-button" onClick={this.editUpdateClick.bind(this)} style={{width: "45%"}} key="1">CONFIRM</button>,
      ];
      return drawButtonGroup;
  }
      else {
          let drawButtonGroup = [
            <button id="cancel-draw-button" onClick={this.cancelClick.bind(this)} style={{width: "45%"}} key="0">CANCEL</button>,
            <button id="finish-draw-button" onClick={this.finishClick.bind(this)} style={{width: "45%"}} key="1">CONFIRM</button>,
        ];
        return drawButtonGroup;
      }
  }

  render() {

    if (!this.props.active) return null;

    return (
      <div className="overlayContainer">
        { this.state.banner }
        <NotificationContainer/>
        <center>
        { this.state.isDrawing ? null : this.renderButtonGroup()}
        { !this.state.isDrawing ? null : this.renderDrawButtonGroup()}
        </center>
        &nbsp;
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
      isEditing: false,
      notification: null,
      tempPolygon: null,
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

  checkOuterPolygonExists() {
      if(this.state.outerPolygon == null){
          return 0;
      } else {
          return 1;
      }
  }

  getInnerPolygonsCount() {
      return this.state.innerPolygons.size();
  }

  drawClickCallback() { }

  clearClickCallback() {
    console.log("clear click");
      let polycount = this.getInnerPolygonsCount()+(this.checkOuterPolygonExists());
      let polygon = this.state.outerPolygon;
      let polygonArray = this.state.innerPolygons;

      if(polycount == 2){
          this.state.outerPolygon.polygon.setOptions({clickable: true});
        }
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
    this.addPolygon();
    this.updatePolygonData();
  }

  cancelClickCallback(buttonState) {
    console.log("cancel click");
    let that = this;
    let appendPromise = new Promise(function(resolve, reject) {
      resolve();
    });

    appendPromise.then(() => {
      that.setState({
          isDrawing: false
      });
    });
    let polygon = this.state.tempPolygon;
    if(polygon){
      polygon.setMap(null);
    }

    //this.removeAllPolygons();
    //console.log("ddddd "+this.state.innerPolygons.getAt(0).convertToLatLng());
    if(this.checkOuterPolygonExists()){
      this.state.outerPolygon.restore();
    }
    for(var i=0;i<this.getInnerPolygonsCount();i++){
      this.state.innerPolygons.getAt(i).restore();
    }
    //console.log("ddddd "+this.state.innerPolygons.getAt(0).convertToLatLng());
    if(this.checkOuterPolygonExists()){
      this.updatePolygonData();
    }

    this.setState({isDrawing: false, isEditing: false});
  }

  editClickCallback() {
      //console.log("qqqq "+this.state.innerPolygons.getAt(0).convertToLatLng());
      this.state.outerPolygon.savePath();
      for(var i=0;i<this.getInnerPolygonsCount();i++){
        this.state.innerPolygons.getAt(i).savePath();
        //console.log(this.state.innerPolygons.getAt(i))
      }
      this.setState({isDrawing: false, isEditing: true});
      //console.log("ddddd "+this.state.innerPolygons.getAt(0).convertToLatLng());
      //console.log("edit click");
  }

  editUpdateClickCallback() {
    console.log("edit update");
    this.updatePolygonData();
    this.setState({isDrawing: false, isEditing: false});
  }

  addClickCallback() {
    let that = this;
    let appendPromise = new Promise(function(resolve, reject) {
      resolve();
    });
    appendPromise.then(() => {
      that.setState({isDrawing: true});
    });
  }

  appendPolygonData() {

      this.addPolygon();

      let that = this;
      let polygon = null;
      var fillColor, fillOpacity;

      if(this.checkOuterPolygonExists() && this.state.polyNum == 0) {
          polygon = this.state.outerPolygon.convertToLatLng();
          fillColor = (this.state.outerPolygon.polygon.fillColor == null)?"0x000000":
                      this.state.outerPolygon.polygon.fillColor.replace("#","0x");
          fillOpacity = this.state.outerPolygon.polygon.fillOpacity;

      }
      else if(this.checkOuterPolygonExists() && (this.state.polyNum < this.getInnerPolygonsCount() + this.checkOuterPolygonExists())){
          let poly = this.state.innerPolygons.getAt(this.getInnerPolygonsCount() - 1);
          polygon = poly.convertToLatLng();
          fillColor = (poly.polygon.fillColor == null)?"0x000000":
                          poly.polygon.fillColor.replace("#","0x");
          fillOpacity = poly.polygon.fillOpacity;

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
          that.setImgUrl( polygon,
                          fillColor,
                          fillOpacity);
        });
      }
  }

  updatePolygonData() {
    let that = this;

    this.setState({url: [], data: [], polyNum: this.getInnerPolygonsCount()+this.checkOuterPolygonExists(), dataReady: false}, () => {

        let updateList=[];
        updateList.push(this.state.outerPolygon);
        for(let i = 0; i < this.getInnerPolygonsCount(); i++){
            updateList.push(this.state.innerPolygons.getAt(i));
        }

        Promise.all(updateList.map((polygon, i) => {
        let polygonPoints = polygon.convertToLatLng();

        if(polygonPoints.length > 0) {
          HTTPService.countPolyResidences(
            { points: polygonPoints }
          ).then(function(json) {
            that.setState(prevState => ({
              data: [...prevState.data, json]
            }));
            let fillColor = (polygon.polygon.fillColor == null)?"0x000000":
                            polygon.polygon.fillColor.replace("#","0x");
            console.log(polygon.polygon.fillOpacity);
            that.setImgUrl( polygonPoints,
                            fillColor,
                            polygon.polygon.fillOpacity);
          });
        }
      })).then(() => {
        this.setState({dataReady: true});
      });
    });
  }

  removeAllPolygons() {
      // if(this.checkOuterPolygonExists()) {
      //     this.state.outerPolygon.remove();
      // }
      if(this.state.innerPolygons.size > 0) {
          for(let i = 0; i < this.state.innerPolygons.size; i++) {
              this.state.innerPolygons.getAt(i).remove();
          }
      }
      this.setState({
          isDrawing: false,
          isEditing: false,
          outerPolygon: null,
          innerPolygons: new PolygonArray(),
          polyNum: 0,
          dataReady: false,
          data: [],
          url: []
      });
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

  getPolygon(polygon) {
      this.setState({tempPolygon: polygon});
  }

  addPolygon() {

    let polygon = this.state.tempPolygon;
    if(polygon != null) {
      if(this.state.outerPolygon==null){
        this.setState({outerPolygon: new Polygon(polygon), innerPolygons: new PolygonArray()});
      }
      else{
        let polygonArray = this.state.innerPolygons;
        polygonArray.push(new Polygon(polygon));
        this.setState({innerPolygons: polygonArray});
        this.state.outerPolygon.polygon.setOptions({clickable: false});
      }
    }
    this.setState({tempPolygon: null});
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

  setImgUrl(polygon, rgb, a){
    let rgba = rgb + Math.floor(parseFloat((a*256).toString(16)));
    let url = "https://maps.googleapis.com/maps/api/staticmap?"
            + "key=AIzaSyC2mXFuLvwiASA3mSr2kz79fnXUYRwLKb8"
            + STATIC_STYLE + "&size=" + IMAGE_DIMENSIONS + "&path=color:" + rgb
            + "|weight:5|fillcolor:" + rgba;
    if(polygon != null && polygon.length >= 2) {
      polygon.forEach(function(position) {
        url += "|" + position.lat.toFixed(6) + "," + position.lng.toFixed(6);
      });
      // Static API doesn't have polygon autocomplete. Close the path manually.
      url += "|" + polygon[0].lat + "," + polygon[0].lng;
    }
    this.setState(prevState => ({
      url: [...prevState.url, url]
    }));
  }

  progressBarData() {
    if (this.checkOuterPolygonExists()) {
      return 1;
    }
    else {
      return 0;
    }
  }

  renderPolygonName(i) {
      if(i == 0) {
          return 'Delivery Zone';
      }
      else {
          return 'Delivery Route ' + (i);
      }
  }
  render() {
    if (!this.props.active) return null;
    return (
      <div className={this.props.active && "navPanel"}>
      <SteppedProgressBar current={this.progressBarData()} num={3} labels={['first', 'second', 'third']}/>

        <Overlay
          active={this.props.active}
          toggleDrawingTools={this.toggleDrawingTools.bind(this)}
          drawClickCallback={this.drawClickCallback.bind(this)}
          clearClickCallback={this.clearClickCallback.bind(this)}
          hasDeliveryZone={this.checkOuterPolygonExists.bind(this)}
          isEditing={this.state.isEditing}
          finishClickCallback={this.finishClickCallback.bind(this)}
          addClickCallback = {this.addClickCallback.bind(this)}
          editClickCallback = {this.editClickCallback.bind(this)}
          editUpdateClickCallback = {this.editUpdateClickCallback.bind(this)}
          cancelClickCallback={this.cancelClickCallback.bind(this)} />
        { (this.state.isDrawing || this.state.isEditing) && this.checkOuterPolygonExists() > 0 ?
          <PolygonTools map={this.props.map}
                        maps={this.props.maps}
                        outerPolygon={this.state.outerPolygon}
                        innerPolygons={this.state.innerPolygons}
                        setPolygonArray={(polygons) => this.setPolygonArray(polygons)} /> : null
        }
        { this.state.isDrawing ?
          <DrawingTools map={this.props.map}
                        maps={this.props.maps}
                        getPolygon={(polygon) => this.getPolygon(polygon)}
                        polyNum={this.checkOuterPolygonExists()} /> : null
        }
        { this.props.active &&
          <div id="navbar-list">
            {this.state.dataReady ? this.state.data.map((itemData, i)=>
              <div className="navbar-count-poly-box" key={i}>
                <div className="navbar-count-poly-title"><p style={{padding: 15}}>{this.renderPolygonName(i)}</p></div>
                <ul className="navbar-count-poly-text">
                  <label className="containerButton">Residences: {this.state.dataReady? itemData.Residential.total:"?"}
                    <input type="checkbox" defaultChecked={true}></input>
                    <span className="checkmark"></span>
                      <ul className="navbar-count-inner-poly-text">
                        <li>Single House: {this.state.dataReady? itemData.Residential["Single Detached Home"]:"?"}</li>
                        <li>House / Duplex: {this.state.dataReady? itemData.Residential["Single Detached Home / Duplex"]:"?"}</li>
                        <li>Townhouse: {this.state.dataReady? itemData.Residential["Townhome"]:"?"}</li>
                        <li>Motor Home: {this.state.dataReady? itemData.Residential["Mobile Home"]:"?"}</li>
                      </ul>
                  </label>

                  <label className="containerButton">Apartments: {this.state.dataReady? itemData.Apartment.total:"?"}
                  <input type="checkbox" defaultChecked={true}></input>
                  <span className="checkmark"></span>

                      <ul className="navbar-count-inner-poly-text">
                          <li>Low Rise Apartment: {this.state.dataReady? itemData.Apartment["Low Rise Apartments"]:"?"}</li>
                          <li>Medium Rise Apartment: {this.state.dataReady? itemData.Apartment["Medium Rise Apartments"]:"?"}</li>
                          <li>High Rise Apartment: {this.state.dataReady? itemData.Apartment["High Rise Apartments"]:"?"}</li>
                      </ul>
                  </label>

                  <label className="containerButton">Industrial: {this.state.dataReady? itemData.Industrial.total:"?"}
                    <input type="checkbox" defaultChecked={true}></input>
                    <span className="checkmark"></span>
                  </label>


                  <label className="containerButton">Commercial: {this.state.dataReady? itemData.Commercial.total:"?"}
                    <input type="checkbox" defaultChecked={true}></input>
                    <span className="checkmark"></span>
                  </label>

                </ul>

                <center><a href={this.state.url[i]} download="map">{<img className="image" src= {this.state.url[i]}/>}</a></center>

              </div>
            ): null}
          </div>
        }
      </div>
    )
  }
}

class Polygon {
    constructor(x){
        this.polygon = x;
        this.prevPath;
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

    savePath() {
      this.prevPath=this.convertToLatLng();
    }

    restore() {
      console.log(this.polygon, this.prevPath);
      this.polygon.setPath(this.prevPath);
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
class PolygonArray {
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
  convertOneToLatLng(polygon) {
    let latLngs = [];
    if(polygon != null) {
      let path = polygon.getPath();
      for(let i = 0; i < path.getLength(); ++i) {
        let vertex = path.getAt(i);
        latLngs.push({
          lat: vertex.lat(),
          lng: vertex.lng()
        });
      }
    }
    return latLngs;
  }

  convertToLatLng(i) {
    let latLngs = [];
    if(i > -1 && i < this.arr.length) {
      let path = this.arr[i].getPath();
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
  // Converts the whole array of polygons to objects with the lat/lng pairs for each point
  convertAllToLatLng() {
    let allPolygons = [];
    for(let i = 0; i < this.arr.length; ++i) {
      allPolygons.push(convertToLatLng(this.arr[i]));
    }

    return allPolygons;
  }
}
