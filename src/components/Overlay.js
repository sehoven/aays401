import React, { Component } from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import ProgressBarView from './ProgressBar.js';
import DrawingTools, { PolygonTools } from './DrawingTools.js';
import 'react-notifications/lib/notifications.css';
import { STATIC_STYLE, IMAGE_DIMENSIONS } from '../settings';
import SteppedProgressBar from 'patchkit-stepped-progress-bar';

const HTTPService = require('./HTTPService.js');
const notificationTimer = 2000;

export class Overlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawing: false
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

    createNotification('draw');
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

    createNotification('finish');
  }

  cancelClick() {
    let callback;
    if(this.props.cancelClickCallback) {
      callback = () => { this.props.cancelClickCallback('cancel'); };
    }
    this.toggleIsDrawing(callback);

    createNotification('cancel');
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
      if(!this.props.hasDeliveryZone()){
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
      polygons: new PolygonArray(),
      polyNum: 0,
      dataReady: false,
      residenceFilter: true,
      apartmentFilter: true,
      industrialFilter: true,
      commercialFilter: true,
      unspecifiedFilter: true
    }

    this.circles = []; // Changing this data shouldn't cause re-render
  }

  toggleFilter(filter){
    switch (filter){
      case "Residences":
        this.setState((prevState) => (
          { residenceFilter: !prevState.residenceFilter }
        ));
        break;
      case "Apartments":
        this.setState((prevState) => (
          { apartmentFilter: !prevState.apartmentFilter }
        ));
        break;
      case "Industrial":
        this.setState((prevState) => (
          { industrialFilter: !prevState.industrialFilter }
        ));
        break;
      case "Commercial":
        this.setState((prevState) => (
          { commercialFilter: !prevState.commercialFilter }
        ));
        break;
      case "Unspecified":
        this.setState((prevState) => (
          { unspecifiedFilter: !prevState.unspecifiedFilter }
        ));
        break;
    }
    this.showUnits();
  }

  toggleDrawingTools(value, callback) {
    this.setState({isDrawing: value}, callback);
  }

  getInnerPolygonsCount() {
      return this.state.innerPolygons.size();
  }

  drawClickCallback() { }

  clearClickCallback() {
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
          this.clearCircles();
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
      // console.log("11 "+this.state.innerPolygons.getAt(i).polygon + " 33 "+this.state.innerPolygons.getAt(i).prevPath);
      // if(this.state.innerPolygons.getAt(i).polygon==null){
      //   console.log("nuuuu");
      // }
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

    this.setState({dataReady: false}, () => {
      Promise.all(this.state.polygons.map((polygon, i) => {
        let polygonPoints = polygon.convertToLatLng();

        if(polygonPoints.length > 0) {
          HTTPService.countPolyResidences(
            { points: polygonPoints }
          ).then(function(json) {
            polygon.setData(json);
            let fillColor = (polygon.getFillColor()) ?
                              polygon.getFillColor().replace("#", "0x") :
                              "0x000000";
            that.setImgUrl( polygonPoints,
                            fillColor,
                            polygon.getFillOpacity());
          });
        }
      })).then(() => {
        this.setState({dataReady: true}, this.showUnits());
      });
    });
  }

  checkOuterPolygonExists() {
    return this.state.polygons.size() >= 1;
  }

  showUnits(){
    createNotification('loading-units');
    // Creates a circle for each point, and a marker for the number
    // Circles are much faster than Markers, so markers are used sparingly
    // for numbers. It's slower to render squares with Markers despite
    // squares having far fewer edges.
    let polygon = this.state.polygons.getOuterPolygon();
    if (!polygon) return null;
    let that = this;
    let points = polygon.convertToLatLng();
    HTTPService.getUnits(points)
    .then(function(json){
      that.clearCircles();
      for (var item in json){
        // radius = 3 @ 1, 6 @ 10, 9 @ 100, 12 @ 1000
        let radius = (1 + Math.floor(Math.log10(json[item]["count"]))) * 3;
        var color;
        switch (json[item]["type"]){
          case "Residential":
            if (!that.state.residenceFilter) continue;
            color = 'rgb(160, 0, 55)';
            break;
          case "Apartment":
            if (!that.state.apartmentFilter) continue;
            color = '#d3882b';
            break;
          case "Industrial":
            if (!that.state.industrialFilter) continue;
            color = '#08d312';
            break;
          case "Commercial":
            if (!that.state.commercialFilter) continue;
            color = '#3e43d3';
            break;
          default:
            if (!that.state.unspecifiedFilter) continue;
            color = 'black';
            break;
        }
        let newCircle = new that.props.maps.Circle({
          title: json[item]["type"] + ", count: " + json[item]["count"],
          strokeWeight: 0,
          fillColor: color,
          fillOpacity: (radius == 3)?0.9:0.6,
          map: that.props.map,
          center: { lat: json[item]["lat"], lng: json[item]["lng"] },
          radius: radius
        });
        that.circles.push(newCircle);
        if (json[item]["count"] > 1){
          var newNumber = new google.maps.Marker({
            position: { lat: json[item]["lat"], lng: json[item]["lng"] },
            icon: {
              path: 'M 0,0 z',
              strokeWeight: 0,
              scale: radius
            },
            label: (json[item]["count"]==1)?null:{
              text: "" + json[item]["count"],
              color: 'white',
              fontSize: "10px"
            },
            map: that.props.map
          });
          that.circles.push(newNumber);
        }
      }
    });
  }

  clearCircles(){
    if (this.circles.length > 0){
      for (var circle in this.circles){
        if (this.circles[circle]){
          this.circles[circle].setMap(null);
        }
      }
    }
    this.circles = []; // Delete old circles by removing references
  }

  removeAllPolygons() {
    this.state.polygons.removeAll();
    this.setState({
      isDrawing: false,
      polygons: new PolygonArray(),
      polyNum: 0,
      dataReady: false
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
                        polygons={this.state.polygons}
                        setPolygonArray={(polygons) => this.setPolygonArray(polygons)} /> : null
        }
        { this.state.isDrawing ?
          <DrawingTools map={this.props.map}
                        maps={this.props.maps}
                        getPolygon={(polygon) => this.getPolygon(polygon)}
                        polyNum={this.checkOuterPolygonExists()} /> : null
        }
        { this.props.active &&
          <div className="parent-height">
            <div className="checkbox-holder">
              <div className="fifth-checkbox">
                <label id="checkbox-red" className="containerButton">
                  <input type="checkbox" onClick={() => this.toggleFilter("Residences")} defaultChecked={true}></input>
                  <span className="checkmark"></span>
                  Residences
                </label>
              </div>
              <div className="fifth-checkbox">
              <label id="checkbox-orange" className="containerButton">
                <input type="checkbox" onClick={() => this.toggleFilter("Apartments")} defaultChecked={true} defaultChecked={true}></input>
                <span className="checkmark"></span>
                Apartments
              </label>
              </div>
              <div className="fifth-checkbox">
              <label id="checkbox-green" className="containerButton">
                <input type="checkbox" onClick={() => this.toggleFilter("Industrial")} defaultChecked={true} defaultChecked={true}></input>
                <span className="checkmark"></span>
                Industrial
              </label>
              </div>
              <div className="fifth-checkbox">
              <label id="checkbox-blue" className="containerButton">
                <input type="checkbox" onClick={() => this.toggleFilter("Commercial")} defaultChecked={true} defaultChecked={true}></input>
                <span className="checkmark"></span>
                Commercial
              </label>
              </div>
              <div className="fifth-checkbox">
              <label id="checkbox-black" className="containerButton">
                <input type="checkbox" onClick={() => this.toggleFilter("Unspecified")} defaultChecked={true} defaultChecked={true}></input>
                <span className="checkmark"></span>
                Unspecified
              </label>
              </div>
            </div>
            <div id="navbar-list-draw">
              {this.state.dataReady ? this.state.data.map((itemData, i)=>
                <div className="navbar-count-poly-box" key={i}>
                  <div className="navbar-image-box"><a href={this.state.url[i]} download="map">{<img className="image" src= {this.state.url[i]}/>}</a></div>
                  <div className="navbar-count-poly-text">
                    { this.state.residenceFilter &&
                      <label className="containerButton">Residences: {this.state.dataReady? itemData.Residential.total:"?"}
                      </label>
                    }
                    { this.state.apartmentFilter &&
                      <label className="containerButton">Apartments: {this.state.dataReady? itemData.Apartment.total:"?"}
                      </label>
                    }
                    { this.state.industrialFilter &&
                      <label className="containerButton">Industrial: {this.state.dataReady? itemData.Industrial.total:"?"}
                      </label>
                    }
                    { this.state.commercialFilter &&
                      <label className="containerButton">Commercial: {this.state.dataReady? itemData.Commercial.total:"?"}
                      </label>
                    }
                    { this.state.unspecifiedFilter &&
                      <label className="containerButton">Unspecified: {this.state.dataReady? itemData.Other:"?"}
                      </label>
                    }
                  </div>
                </div>
              ): null}
            </div>
          </div>
        }
      </div>
    )
  }
}

class Polygon {
  constructor(x){
    this.polygon = x;
    this.data;
    this.url;
    this.prevPath;
  }

  setData(data) {
    this.data = data;
  }

  setUrl(url) {
    this.url = url;
  }

  getFillColor() {
    return this.polygon.fillColor
  }

  getFillOpacity() {
    return this.polygon.fillOpacity
  }

  savePath() {
    this.prevPath = this.convertToLatLng();
  }

  restore() {
    if(this.prevPath != null) {
      this.polygon.setPath(this.prevPath);
    }
  }

  remove() {
    let removed = this.polygon;
    if(removed != null) {
      removed.setMap(null);
    }
    return null;
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
}

// Class to handle the polygon objects visible on the map.
class PolygonArray {
  constructor(...x) {
    this.arr = [...x];
  }

  getAll() {
    return this.arr;
  }

  getOuter() {
    return this.arr.splice(0, 1);
  }

  getAllInner() {
    return this.arr.slice(1);
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

  removeAll() {
    for(let i = this.arr.length - 1; i >= 0; --i) {
      let removed = this.arr.splice(i, 1);
      removed[0].setMap(null);
    }
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

  // Converts the whole array of polygons to objects with the lat/lng pairs for each point
  convertAllToLatLng() {
    let allPolygons = [];
    for(let i = 0; i < this.arr.length; ++i) {
      allPolygons.push(convertToLatLng(this.arr[i]));
    }

    return allPolygons;
  }
}

function createNotification(type, ){
  switch (type) {
      case 'draw':
        NotificationManager.info('Draw Outer Delivery Zone','',notificationTimer);
        break;
      case 'inner':
        NotificationManager.info('Draw Individual Zones Routes','',notificationTimer);
        break;
      case 'finish':
        NotificationManager.success('Delivery Route Map Generated','',notificationTimer);
        break;
      case 'clear':
        NotificationManager.warning('Cleared Polygon','', notificationTimer);
        break;
      case 'error':
        NotificationManager.error('Error message', 'Click me!', notificationTimer, () => {
          alert('callback');
        });
        break;
      case 'loading-units':
        NotificationManager.info('Loading Units','', notificationTimer);
        break;
    };
};
