import React, { Component } from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import DrawingTools, { PolygonTools } from './DrawingTools.js';
import 'react-notifications/lib/notifications.css';

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
    let cancelButton = <button id="cancel-draw-button" onClick={this.cancelClick.bind(this)}>RETURN</button>;
    let finishButton = <button id="finish-draw-button" onClick={this.finishClick.bind(this)}>FINISH</button>;
    let addButton = <button id="add-draw-button" onClick={this.addClick.bind(this)}>ADD</button>;

    return (
      <div className="overlayContainer">
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
      data: [],
      url: []
    }

    this.circles = []; // Changing this data shouldn't cause re-render
  }

  toggleDrawingTools(value, callback) {
    this.setState({isDrawing: value}, callback);
  }

  drawClickCallback() { }

  clearClickCallback() {
    let polycount = this.state.polygons.size();
    let polygonArray = this.state.polygons;
    polygonArray.pop();
    this.setState((prevState) => ({
      polygons: polygonArray,
      url: [...prevState.url.slice(0, this.state.url.length - 1)],
      data: [...prevState.data.slice(0, this.state.data.length - 1)],
      polyNum: --prevState.polyNum
    }));

    if (polygonArray.size() == 0) this.clearCircles();
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

    if(this.state.polyNum < this.state.polygons.size()) {
      let polygon = this.state.polygons.convertToLatLng(this.state.polyNum);
      if(polygon.length > 0) {
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
  }

  updatePolygonData() {
    let that = this;

    this.setState({url: [], data: [], polyNum: this.state.polygons.size(), dataReady: false}, () => {
      Promise.all(this.state.polygons.getAll().map((polygon, i) => {
        let polygonPoints = this.state.polygons.convertOneToLatLng(polygon);
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
    let polygon = this.state.polygons.getAt(0);
    if (!polygon) return null;
    let that = this;
    let points = this.state.polygons.convertOneToLatLng(polygon);
    HTTPService.getUnits(points)
    .then(function(json){
      that.clearCircles();
      for (var item in json){
        // radius = 3 @ 1, 6 @ 10, 9 @ 100, 12 @ 1000
        let radius = (1 + Math.floor(Math.log10(json[item]["count"]))) * 3;
        let newCircle = new that.props.maps.Circle({
          title: json[item]["type"] + ", count: " + json[item]["count"],
          strokeWeight: 0,
          fillColor: '#FF0000',
          fillOpacity: (radius == 3)?0.9:0.6,
          map: that.props.map,
          center: { lat: json[item]["lat"], lng: json[item]["lng"] },
          radius: radius
        });
        that.circles.push(newCircle);
        // It's tempting to make an invisible marker for all points to give them
        // all tooltips, but that makes the app unusable
        if (json[item]["count"] > 1){
          var newNumber = new google.maps.Marker({
            title: json[item]["type"] + ", count: " + json[item]["count"],
            position: { lat: json[item]["lat"], lng: json[item]["lng"] },
            icon: {
              path: 'M 1,1 -1,1 -1,-1 1,-1 z', // This is hacky, but alternatives are >100 lines
              strokeWeight: 0,
              scale: radius
            },
            label: (json[item]["count"]==1)?null:{
              text: "" + json[item]["count"],
              color: 'white',
              fontSize: "8px"
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

  addFirstPolygon(polygon) {
    if(polygon != null) {
      let polygonArray = this.state.polygons;
      polygonArray.clear();
      polygonArray.push(polygon);
      this.setState({polygons: polygonArray}, () => {
        this.updatePolygonData();
      });
    }
  }

  addPolygon(polygon) {
    if(polygon != null) {
      let polygonArray = this.state.polygons;
      polygonArray.push(polygon);
      this.setState({polygons: polygonArray});
    }
  }

  setPolygonArray(polygons) {
    if(polygons != null) {
      let polygonArray = new PolygonArray(...polygons);
      this.setState({polygons: polygonArray});
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
          canClear={ (this.state.polygons != null) }
          finishClickCallback={this.finishClickCallback.bind(this)}
          addClickCallback = {this.addClickCallback.bind(this)}
          cancelClickCallback={this.cancelClickCallback.bind(this)} />
        { this.state.isDrawing && this.state.polygons.size() > 0 ?
          <PolygonTools map={this.props.map}
                        maps={this.props.maps}
                        polygons={this.state.polygons}
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
    if(popped != null) {
      popped.setMap(null);
    }
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
      //case 'cancel':
      // NotificationManager.warning('Removed Last Drawn Polygon','' ,notificationTimer);
      //  break;
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
