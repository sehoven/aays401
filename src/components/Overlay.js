import React, { Component } from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import DrawingTools, { PolygonTools } from './DrawingTools.js';
<<<<<<< HEAD
import 'react-notifications/lib/notifications.css';
=======
import { STATIC_STYLE, IMAGE_DIMENSIONS } from '../settings';
>>>>>>> 0bc3f2313e54cf5a19d6a094e1a9e69b41498e8e

const HTTPService = require('./HTTPService.js');
const notificationTimer = 2000;

export class Overlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawing: false,
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
    createNotification('clear');
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
      callback = () => { this.props.cancelClickCallback(); };
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

    createNotification('inner');
  }

  render() {

    if (!this.props.active) return null;

    let drawButton = <button id="draw-button" onClick={this.drawClick.bind(this)}>DRAW</button>;
    let clearButton = <button id="clear-button" onClick={this.clearClick.bind(this)}>CLEAR</button>;
    let cancelButton = <button id="cancel-draw-button" style={{width: 120}} onClick={this.cancelClick.bind(this)}>RETURN</button>;
    let finishButton = <button id="finish-draw-button" style={{width: 120}} onClick={this.finishClick.bind(this)}>FINISH</button>;
    let addButton = <button id="add-draw-button" style={{width: 120}}  onClick={this.addClick.bind(this)}>ADD</button>;

    return (
      <div className="overlayContainer">
        <NotificationContainer/>
        <center>
        { this.state.isDrawing ? null : drawButton }
        { this.state.isDrawing || !this.props.canClear ? null : clearButton }
        { this.state.isDrawing ? cancelButton : null }
        { this.state.isDrawing ? finishButton : null }
        { this.state.isDrawing ? addButton : null }
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
      outerPolygon: null,
      innerPolygons: new PolygonArray(),
      polyNum: 0,
      dataReady: false,
      data: [],
      url: []
    }

    this.circles = []; // Changing this data shouldn't cause re-render
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
      let polycount = this.getInnerPolygonsCount()+this.checkOuterPolygonExists();
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

    this.setState({url: [], data: [], polyNum: this.getInnerPolygonsCount() + this.checkOuterPolygonExists(), dataReady: false}, () => {

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
          ).then(function(json){
            that.setState(prevState => ({
              data: [...prevState.data, json]
            }));
            let fillColor = (polygon.polygon.fillColor == null)?"0x000000":
                            polygon.polygon.fillColor.replace("#","0x");
            that.setImgUrl( polygonPoints,
                            fillColor,
                            polygon.polygon.fillOpacity);
          });
        }
      })).then(() => {
        this.setState({dataReady: true}, this.showUnits());
      });
    });
  }

  showUnits(){
    createNotification('loading-units');
    // Creates a circle for each point, and a marker for the number
    // Circles are much faster than Markers, so markers are used sparingly
    // for numbers. It's slower to render squares with Markers despite
    // squares having far fewer edges.
    let polygon = this.state.outerPolygon;
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
            color = 'rgb(160, 0, 55)';
            break;
          case "Apartment":
            color = '#d3882b';
            break;
          case "Industrial":
            color = '#08d312';
            break;
          case "Commercial":
            color = '#3e43d3';
            break;
          default:
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
    if(this.checkOuterPolygonExists()) {
      this.state.outerPolygon.remove();
    }
    if(this.state.innerPolygons.size > 0) {
      for(let i = 0; i < this.state.innerPolygons.size; i++) {
        this.state.innerPolygons.getAt(i).remove();
      }
    }
    this.setState({
      isDrawing: false,
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

  render() {
    if (!this.props.active) return null;
    return (
      <div className={this.props.active && "navPanel"}>
        <Overlay
          active={this.props.active}
          toggleDrawingTools={this.toggleDrawingTools.bind(this)}
          drawClickCallback={this.drawClickCallback.bind(this)}
          clearClickCallback={this.clearClickCallback.bind(this)}
          canClear={ (this.getInnerPolygonsCount()+this.checkOuterPolygonExists() != null) }
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
                <div className="navbar-image-box"><a href={this.state.url[i]} download="map">{<img className="image" src= {this.state.url[i]}/>}</a></div>
                <div className="navbar-count-poly-text">
                  <label className="containerButton">Residences: {this.state.dataReady? itemData.Residential.total:"?"}
                  </label>
                  <label className="containerButton">Apartments: {this.state.dataReady? itemData.Apartment.total:"?"}
                  </label>
                  <label className="containerButton">Industrial: {this.state.dataReady? itemData.Industrial.total:"?"}
                  </label>
                  <label className="containerButton">Commercial: {this.state.dataReady? itemData.Commercial.total:"?"}
                  </label>
                  <label className="containerButton">Unspecified: {this.state.dataReady? itemData.Other:"?"}
                  </label>
                </div>
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
