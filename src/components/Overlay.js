import React, { Component } from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
// import ProgressBarView from './ProgressBar.js';
import DrawingTools from './DrawingTools.js';
import 'react-notifications/lib/notifications.css';
import { STATIC_STYLE, IMAGE_DIMENSIONS } from '../settings';
import Modal from 'react-modal';
import jszipUtils from 'jszip-utils';
import Canvas from './Canvas.js'
const HTTPService = require('./HTTPService.js');
const notificationTimer = 2000;

export class Overlay extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDrawing: false
    }
  }

  drawClick() {
    let callback;

    if(this.props.drawClickCallback) {
      callback = this.props.drawClickCallback();
    }

    createNotification('draw');
  }

  clearClick() {
    let callback;

    if(this.props.clearClickCallback) {
      callback = this.props.clearClickCallback();
    }
    if(this.props.hasDeliveryZone()) {
      createNotification('clear');
    }
  }

  confirmClick() {
    let callback;
    if(this.props.confirmClickCallback) {
      callback = this.props.confirmClickCallback();
    }

    createNotification('finish');
  }

  outputClick(){
    let callback;
    if(this.props.outputClickCallback) {
      callback = this.props.outputClickCallback();
    }
  }

  cancelClick() {
    let callback;
    if(this.props.cancelClickCallback) {
      callback = this.props.cancelClickCallback();
    }

    createNotification('cancel');
  }

  addClick(){
    let callback;
    if(this.props.addClickCallback) {
      callback = this.props.addClickCallback();
    }

    createNotification('inner');
  }

  editClick(){
    let callback;
    if(this.props.editClickCallback) {
      callback = this.props.editClickCallback();
    }
    createNotification('edit');
  }

  renderButtonGroup() {
    switch (this.props.containerState) {
      case 1:
        return (
          <button id="draw-button" onClick={this.drawClick.bind(this)} style={{width: "90%"}} key="0">DRAW</button>
        );
      case 2:
        return [
          <button id="cancel-draw-button" onClick={this.cancelClick.bind(this)} style={{width: "45%"}} key="0">CANCEL</button>,
          <button id="confirm-draw-button" onClick={this.confirmClick.bind(this)} style={{width: "45%"}} key="1">CONFIRM</button>
        ];
      case 3:
        return [
          <button id="draw-button" onClick={this.drawClick.bind(this)} style={{width: "28%",height: "50%"}} key="0">ADD</button>,
          <button id="clear-button" onClick={this.clearClick.bind(this)} style={{width: "28%",height: "50%"}} key="1">CLEAR</button>,
          <button id="edit-button" onClick={this.editClick.bind(this)} style={{width: "28%",height: "50%"}} key="9">EDIT</button>,
        ];
    }
  }

  render() {
    if (!this.props.active) return null;

    return (
      <div className="overlayContainer">
        <NotificationContainer/>
        <center>
          { this.renderButtonGroup()}
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

    this.polygonArray = new PolygonArray(this.props.map, this.props.maps, this);
    this.lastFlag = null;
    this.cancelFlag = null;

    this.state = {
      iterable: null,
      buttons: 1,
      isDrawing: false,
      isEditing: false,
      filter: {
        residenceFilter: true,
        apartmentFilter: true,
        industrialFilter: true,
        commercialFilter: true,
        unspecifiedFilter: true
      },
      showModal: false,
      currentImage: 1,
    }
    this.circles = []; // Changing this data shouldn't cause re-render

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.PreviousImage = this.PreviousImage.bind(this);
    this.NextImage = this.NextImage.bind(this);
  }

  componentWillReceiveProps(props){
    if (!this.props.active) {
      this.setState({ isDrawing: false,
                      isEditing: false,
                      buttons: this.checkOuterPolygonExists()?3:1});
    }
  }

  clearClickCallback() {
    if(this.polygonArray.size() > 0) {
      this.polygonArray.pop();
    }
    if(this.polygonArray.getLength() == 0){
      this.setState({ buttons: 1 });
      this.props.setProgressState(0);
    } else if (this.polygonArray.getAllInner().length > 0) {
      this.props.setProgressState(2);
    } else if (this.polygonArray.getOuter()) {
      this.props.setProgressState(1);
    }
  }

  confirmClickCallback() {
    this.lastFlag = false;
    this.polygonArray.saveEdits();
    this.setState({ isEditing: false, isDrawing: false, buttons: 3 });
    if(this.polygonArray.getAllInner().length > 0) {
      this.props.setProgressState(2);
    } else {
      this.props.setProgressState(1);
    }
  }

  completedFlag(flag){
    this.lastFlag = flag;
  }

  cancelClickCallback() {
    this.polygonArray.setNoCirclesFlag(true);
    this.cancelFlag = true;
    if (this.state.isEditing){
      this.polygonArray.cancelEdits();
      this.setState({ isEditing: false, isDrawing: false, buttons: 3 });
      this.props.setProgressState(1);
    }
    if (this.state.isDrawing && this.polygonArray.getLength() == 0){
      this.setState({ isDrawing: false, buttons: 1 });
      this.props.setProgressState(0);
    }
    if (this.state.isDrawing && this.polygonArray.getLength() == 1){
      this.setState({ isDrawing: false, buttons: 1 });
      this.props.setProgressState(0);
    }
    if (this.state.isDrawing && this.polygonArray.getLength() > 1){
      this.setState({ isDrawing: false, buttons: 3 });
      this.props.setProgressState(1);
    }
  }

  drawClickCallback(){
    this.cancelFlag = false;
    this.setState({ isDrawing: true, buttons: 2 });
  }

  editClickCallback() {
    this.polygonArray.setModeEdit();
    this.setState({isEditing: true, buttons: 2});
  }

  outputClickCallback(){
    this.handleOpenModal();
    this.props.setProgressState(2);
  }

  addClickCallback() {
    this.cancelFlag = false;
    this.setState({isDrawing: true, buttons: 2 });
  }

  checkOuterPolygonExists() {
    return this.polygonArray.outerExists();
  }

  addFirstPolygon(polygon) {
    if (polygon != null){
      this.polygonArray.clear();
      this.polygonArray.pushBasic(polygon);
      this.setState({ buttons: 3 });
    }
  }

  setPolygonArray(polygon) {
    if(polygon != null) {
      this.polygonArray.pushNew(polygon);
      if (this.lastFlag && this.cancelFlag) {
        this.polygonArray.pop();
        this.lastFlag = false;
        this.cancelFlag = false;
      }
    }
    if (this.polygonArray.getLength()) {
      this.setState({ isDrawing: false, buttons: 3 });
      if(this.polygonArray.getAllInner().length > 0) {
        this.props.setProgressState(2);
      } else {
        this.props.setProgressState(1);
      }
    } else {
      this.setState({ isDrawing: false, buttons: 1 });
      this.props.setProgressState(0);
    }
  }

  handleOpenModal () {
    if (this.polygonArray.getLength() > 1){
      this.setState({ showModal: true, currentImage: 1 });
    }
  }

  handleCloseModal () {
    this.setState({ showModal: false });
  }

  PreviousImage(){
    let previous = this.state.currentImage-1
    {previous>=0&& this.setState({currentImage:previous})}
  }

  NextImage(){
    let next = this.state.currentImage+1
    {next<this.polygonArray.getLength()&&this.setState({currentImage:next})}
  }

  saveImages(type){
    var urls;
    switch (type) {
      case "color":
        urls = this.polygonArray.getListIterable().map(function(item){
          return item.image;
        }).slice(1);
        break;
      case "bw":
        urls = this.polygonArray.getAllInner().map(function(poly){
          let polygon = poly.convertToLatLng();
          let url = "https://maps.googleapis.com/maps/api/staticmap?"
                  + "key=AIzaSyC2mXFuLvwiASA3mSr2kz79fnXUYRwLKb8"
                  + STATIC_STYLE + "&size=" + IMAGE_DIMENSIONS + "&path=color:" + "0x000000"
                  + "|weight:5|fillcolor:" + "0x00000000";
          if(polygon != null && polygon.length >= 2) {
            polygon.forEach(function(position) {
              url += "|" + position.lat.toFixed(6) + "," + position.lng.toFixed(6);
            });
            // Static API doesn't have polygon autocomplete. Close the path manually.
            url += "|" + polygon[0].lat + "," + polygon[0].lng;
          }
          return url;
        });
        break;
      default:
        urls = [];
        break;
    }

    var JSZip = require("jszip");
    var FileSaver = require('file-saver');
    var zip = new JSZip();
    var count = 0;
    var zipFilename = "Download.zip";
    urls.forEach(function(url){
      var filename = "map"+urls.indexOf(url)+".png";
      jszipUtils.getBinaryContent(url, function (err, data) {
        if(err) {
          throw err; // or handle the error
        }
        zip.file(filename, data, {binary:true});
        count++;
        if (count == urls.length) {
          var zipFile = zip.generate({type: "blob"});
          FileSaver.saveAs(zipFile, zipFilename);
        }
      })
    })
  }

  render() {
    //      <ProgressBarView data={this.progressBarData.bind(this)}/>

    if (!this.props.active) return null;
    return (
      <div className={"navPanel"}>
        { this.polygonArray.getLength() > 1 &&
          <button onClick={this.handleOpenModal} id="output-button">EXPORT</button>
        }
        <Overlay
          active={this.props.active}
          containerState={this.state.buttons}
          drawClickCallback={this.drawClickCallback.bind(this)}
          clearClickCallback={this.clearClickCallback.bind(this)}
          outputClickCallback = {this.outputClickCallback.bind(this)}
          hasDeliveryZone={this.checkOuterPolygonExists.bind(this)}
          isEditing={this.state.isEditing}
          confirmClickCallback={this.confirmClickCallback.bind(this)}
          addClickCallback = {this.addClickCallback.bind(this)}
          editClickCallback = {this.editClickCallback.bind(this)}
          cancelClickCallback={this.cancelClickCallback.bind(this)} />
        { this.state.isDrawing ?
          <DrawingTools map={this.props.map}
                        maps={this.props.maps}
                        addPolygon={(polygon) => this.setPolygonArray(polygon)}
                        polyNum={this.checkOuterPolygonExists()}
                        flagCallback={(value) => this.completedFlag(value)} /> : null
        }
        { this.state.showModal ?
          <div>
            <Modal
                  isOpen={this.state.showModal}
                  contentLabel="Output Map"
                  onRequestClose={this.handleCloseModal}
                  className = "modal-window"
                  overlayClassName="modal-overlay"
                >

                <div id="modal-box">
                  <div id="export-modal-left">
                    <div className={"buttonVertical " + ((this.state.currentImage == 1) ? "hide" : "" )} onClick = {this.PreviousImage}>
                      <div className="vertical-button-text">◀</div>
                    </div>
                  </div>
                  <div id="export-modal-center">
                    <div className="popup-title">Delivery zone review</div>
                    <img className="modal-image"src={this.state.iterable[this.state.currentImage].image}/>
                  </div>
                  <div id="export-modal-right">
                  <div className={"buttonVertical " + ((this.state.currentImage == this.polygonArray.getLength()-1) ? "hide" : "" )} onClick = {this.NextImage}>
                    <div className="vertical-button-text">▶</div>
                  </div>
                  </div>
                    <div className="export-modal-details">
                      <div id="modal-data-box" className="modal-text">
                        { this.state.filter.residenceFilter &&
                          <label className="containerModalButton">Residences: {this.state.iterable[this.state.currentImage].values? this.state.iterable[this.state.currentImage].values.Residential.total:"?"}
                          </label>
                        }
                        { this.state.filter.apartmentFilter &&
                          <label className="containerModalButton">Apartments: {this.state.iterable[this.state.currentImage].values? this.state.iterable[this.state.currentImage].values.Apartment.total:"?"}
                          </label>
                        }
                        { this.state.filter.industrialFilter &&
                          <label className="containerModalButton">Industrial: {this.state.iterable[this.state.currentImage].values? this.state.iterable[this.state.currentImage].values.Industrial.total:"?"}
                          </label>
                        }
                        { this.state.filter.commercialFilter &&
                          <label className="containerModalButton">Commercial: {this.state.iterable[this.state.currentImage].values? this.state.iterable[this.state.currentImage].values.Commercial.total:"?"}
                          </label>
                        }
                        { this.state.filter.unspecifiedFilter &&
                          <label className="containerModalButton">Unspecified: {this.state.iterable[this.state.currentImage].values? this.state.iterable[this.state.currentImage].values.Other:"?"}
                          </label>
                        }
                      </div>
                      <div id="save-button-group">
                        <button className={(this.state.currentImage == this.polygonArray.getLength()-1) ? "" : "hide" }
                        onClick = {() => {this.saveImages("color")}}>Save In Color</button>
                        <button  className={(this.state.currentImage == this.polygonArray.getLength()-1) ? "" : "hide" }
                        onClick = {() => {this.saveImages("bw")}}>Save In Black And White</button>
                      </div>
                    </div>
                  </div>
              </Modal>
          </div>
        :null
        }
        <div className="parent-height">
            <div className="checkbox-holder">
              <div className="fifth-checkbox">
                <label id="checkbox-red" className="containerButton">
                  <input type="checkbox" onClick={() => this.polygonArray.toggleFilter("Residences")} defaultChecked={true}></input>
                  <span className="checkmark"></span>
                  Residences
                </label>
              </div>
              <div className="fifth-checkbox">
              <label id="checkbox-orange" className="containerButton">
                <input type="checkbox" onClick={() => this.polygonArray.toggleFilter("Apartments")} defaultChecked={true} defaultChecked={true}></input>
                <span className="checkmark"></span>
                Apartments
              </label>
            </div>
            <div className="fifth-checkbox">
            <label id="checkbox-green" className="containerButton">
              <input type="checkbox" onClick={() => this.polygonArray.toggleFilter("Industrial")} defaultChecked={true} defaultChecked={true}></input>
              <span className="checkmark"></span>
              Industrial
            </label>
            </div>
            <div className="fifth-checkbox">
            <label id="checkbox-blue" className="containerButton">
              <input type="checkbox" onClick={() => this.polygonArray.toggleFilter("Commercial")} defaultChecked={true} defaultChecked={true}></input>
              <span className="checkmark"></span>
              Commercial
            </label>
            </div>
            <div className="fifth-checkbox">
            <label id="checkbox-black" className="containerButton">
              <input type="checkbox" onClick={() => this.polygonArray.toggleFilter("Unspecified")} defaultChecked={true} defaultChecked={true}></input>
              <span className="checkmark"></span>
              Unspecified
            </label>
            </div>
          </div>
          <div id="navbar-list-draw">
            { this.state.iterable ? this.state.iterable.map((itemData, i)=>
              <div className="navbar-count-poly-box" key={i}>
                <div className="navbar-image-box"><a href={itemData.image} download="map">{<img className="image" src= {itemData.image}/>}</a></div>
                <div className="navbar-count-poly-text">
                  { this.state.filter.residenceFilter &&
                    <label className="containerButton">Residences: {itemData.values? itemData.values.Residential.total:"?"}
                    </label>
                  }
                  { this.state.filter.apartmentFilter &&
                    <label className="containerButton">Apartments: {itemData.values? itemData.values.Apartment.total:"?"}
                    </label>
                  }
                  { this.state.filter.industrialFilter &&
                    <label className="containerButton">Industrial: {itemData.values? itemData.values.Industrial.total:"?"}
                    </label>
                  }
                  { this.state.filter.commercialFilter &&
                    <label className="containerButton">Commercial: {itemData.values? itemData.values.Commercial.total:"?"}
                    </label>
                  }
                  { this.state.filter.unspecifiedFilter &&
                    <label className="containerButton">Unspecified: {itemData.values? itemData.values.Other:"?"}
                    </label>
                  }
                </div>
              </div>
            ): null}
          </div>
        </div>
      </div>
    )
  }
}

export class Polygon {
  constructor(x){
    this.polygon = x;
    this.unitCounts;
    this.imgUrl;
    this.prevPath;
    this.exists = true;
  }

  setClickListener(maps){
    let that = this;
    maps.event.addListener(this.polygon, "click", function(e) {
      if(e.vertex != null) {
        let path = this.getPaths().getAt(e.path);
        path.removeAt(e.vertex);
        if(path.length < 3) {
          that.exists = false;
          that.setMap(null);
        }
      }
    });
  }

  setEditable(boolean){
    this.polygon.setOptions({ editable: boolean });
  }

  toggleEditable(){
    this.polygon.setOptions({ editable: !this.polygon.editable });
  }

  setClickable(boolean){
    this.polygon.setOptions({ clickable: boolean });
  }

  setMap(value){
    this.polygon.setMap(value);
  }

  setFillColor(color){
    this.polygon.setOptions({fillColor: color});
    this.updateUrls();
  }

  getFillColor() {
    return (this.polygon.fillColor == null)?"0x000000":
            this.polygon.fillColor.replace("#","0x");
  }

  getFillOpacity() {
    return this.polygon.fillOpacity;
  }

  setFillOpacity(alpha){
    this.polygon.setOptions({fillOpacity: alpha});
    this.updateUrls();
  }

  getUnitCounts(){
    return this.unitCounts;
  }

  updateUnitCounts(grandparent, parent){
    let that = this;
    return HTTPService.countPolyResidences(
        { points: that.convertToLatLng() }
    ).then(function(json){
      that.unitCounts = json;
      grandparent.setState({ iterable: parent.getListIterable() });
    });
  }

  updateUrls(){
    let rgb = this.getFillColor();
    let a = this.getFillOpacity();
    let rgba = rgb + Math.floor(parseFloat((a*256).toString(16)));
    let polygon = this.convertToLatLng();
    let colorUrl = "https://maps.googleapis.com/maps/api/staticmap?"
            + "key=AIzaSyC2mXFuLvwiASA3mSr2kz79fnXUYRwLKb8"
            + STATIC_STYLE + "&size=" + IMAGE_DIMENSIONS + "&path=color:" + rgb
            + "|weight:5|fillcolor:" + rgba;
    if(polygon != null && polygon.length >= 2) {
      polygon.forEach(function(position) {
        colorUrl += "|" + position.lat.toFixed(6) + "," + position.lng.toFixed(6);
      });
      // Static API doesn't have polygon autocomplete. Close the path manually.
      colorUrl += "|" + polygon[0].lat.toFixed(6) + "," + polygon[0].lng.toFixed(6);
      return colorUrl;
    }
  }

  savePath() {
    this.prevPath = this.convertToLatLng();
  }

  restorePath() {
    if(this.prevPath != null) {
      this.polygon.setPath(this.prevPath);
    }
  }

  delete() {
    if(this.polygon != null) {
      this.polygon.setMap(null);
    }
  }

  isDeleted(){
    return !this.exists;
  }

  restore(map) {
    this.polygon.setMap(map);
    this.exists = true;
  }

  convertToLatLng() {
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
export class PolygonArray {
  constructor(map, maps, parent, ...x) {
    this.map = map;
    this.maps = maps;
    this.parent = parent;
    this.arr = [...x];
    this.circles = [];
    this.residenceFilter = true;
    this.apartmentFilter = true;
    this.industrialFilter = true;
    this.commercialFilter = true;
    this.unspecifiedFilter = true;
    this.noCirclesFlag = false;
  }

  getAll() {
    return this.arr;
  }

  getLength(){
    return this.arr.length;
  }

  getOuter() {
    return this.arr.slice(0, 1);
  }

  outerExists(){
    return (this.arr.length >= 1);
  }

  getAllInner() {
    return this.arr.slice(1);
  }

  getListIterable(){
    let thia = [];
    for (let i = 0; i < this.arr.length; i++){
      thia.push({ image: this.arr[i].updateUrls(), values: this.arr[i].getUnitCounts() })
    }
    return thia;
  }

  setModeAddPolygon() {
    this.arr.forEach((polygon) => function(){
      polygon.setEditable(false);
      polygon.setClickable(false);
      polygon.savePath();
    })
  }

  setModeEdit() {
    this.arr.forEach(function(polygon){
      polygon.setEditable(true);
      polygon.savePath();
    });
    if (this.arr.length > 1){
      if (this.arr[0]){
        this.arr[0].setEditable(false);
      }
    }
  }

  deselectAll() {
    this.arr.forEach(function(polygon){
      polygon.setEditable(false);
      polygon.setClickable(false);
    });
  }

  cancelEdits() {
    let that = this;
    this.arr.forEach(function(polygon){
      polygon.restore(that.map);
      polygon.setEditable(false);
      polygon.setClickable(false);
      polygon.restorePath();
    })
  }

  saveEdits(){
    this.deselectAll();
    this.arr.forEach(function(polygon){
      polygon.setEditable(false);
      polygon.setClickable(false);
    })
    this.pruneDeleted();
    let indices = [];
    for (var i = 0; i < this.arr.length; i++){
      indices.push(i);
    }
    this.updateData(indices);
  }

  updateData(indices){
    let promises = [];
    let that = this;
    this.arr.forEach(function(polygon, i){
      if (indices.indexOf(i) != -1){
        that.arr[i].updateUnitCounts(that.parent, that);
      }
    });
  }

  pruneDeleted() {
    this.arr = this.arr.filter(function(item){
      return !item.isDeleted();
    });
  }

  toggleFilter(filter){
    switch (filter){
      case "Residences":
          this.residenceFilter = !this.residenceFilter;
        break;
      case "Apartments":
          this.apartmentFilter = !this.apartmentFilter ;
        break;
      case "Industrial":
          this.industrialFilter = !this.industrialFilter;
        break;
      case "Commercial":
          this.commercialFilter = !this.commercialFilter;
        break;
      case "Unspecified":
          this.unspecifiedFilter = !this.unspecifiedFilter;
        break;
    }

    for (var c in this.circles){
      switch (this.circles[c].type){
        case "Residential":
            if (this.residenceFilter){
              this.circles[c].setMap(this.map);
            } else {
              this.circles[c].setMap(null);
            }
        break;
        case "Apartment":
          if (this.apartmentFilter){
            this.circles[c].setMap(this.map);
          } else {
            this.circles[c].setMap(null);
          }
          break;
        case "Industrial":
          if (this.industrialFilter){
            this.circles[c].setMap(this.map);
          } else {
            this.circles[c].setMap(null);
          }
          break;
        case "Commercial":
          if (this.commercialFilter){
            this.circles[c].setMap(this.map);
          } else {
            this.circles[c].setMap(null);
          }
          break;
        default:
          if (this.unspecifiedFilter){
            this.circles[c].setMap(this.map);
          } else {
            this.circles[c].setMap(null);
          }
          break;
      }
    }

    this.parent.setState(
      { filter: {
        residenceFilter: this.residenceFilter,
        apartmentFilter: this.apartmentFilter,
        industrialFilter: this.industrialFilter,
        commercialFilter: this.commercialFilter,
        unspecifiedFilter: this.unspecifiedFilter
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

  push(polygon) {
    if(polygon != null) {
      this.arr.push(polygon);
      polygon.setClickListener(this.maps);
      this.deselectAll();
      if (this.arr.length == 1 && !this.noCirclesFlag){
        createNotification('loading-units');
        // Creates a circle for each point, and a marker for the number
        // Circles are much faster than Markers, so markers are used sparingly
        // for numbers. It's slower to render squares with Markers despite
        // squares having far fewer edges.
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
                if (!that.residenceFilter) continue;
                color = 'rgb(160, 0, 55)';
                break;
              case "Apartment":
                if (!that.apartmentFilter) continue;
                color = '#d3882b';
                break;
              case "Industrial":
                if (!that.industrialFilter) continue;
                color = '#08d312';
                break;
              case "Commercial":
                if (!that.commercialFilter) continue;
                color = '#3e43d3';
                break;
              default:
                if (!that.unspecifiedFilter) continue;
                color = 'black';
                break;
            }
            let newCircle = new that.maps.Circle({
              type: json[item]["type"],
              title: json[item]["type"] + ", count: " + json[item]["count"],
              strokeWeight: 0,
              fillColor: color,
              fillOpacity: (radius == 3)?0.9:0.6,
              map: that.map,
              center: { lat: json[item]["lat"], lng: json[item]["lng"] },
              radius: radius
            });
            that.circles.push(newCircle);
            if (json[item]["count"] > 1){
              var newNumber = new that.maps.Marker({
                type: json[item]["type"],
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
                map: that.map
              });
              that.circles.push(newNumber);
            }
          }
        });
      }
      this.noCirclesFlag = false;
      this.updateData([this.arr.length - 1]);
    }
  }

  setNoCirclesFlag(flag) {
    this.noCirclesFlag = flag;
  }

  pushBasic(googlePoly) {
    let polygon = new Polygon(googlePoly);
    polygon.setFillColor("0x000000");
    polygon.setFillOpacity(0.1);
    this.push(polygon);
  }

  pushNew(googlePoly) {
    let polygon = new Polygon(googlePoly);
    polygon.setFillColor(googlePoly.fillColor);
    if (this.arr.length == 0){
      polygon.setFillOpacity(0.1);
    } else {
      polygon.setFillOpacity(0.5);
    }
    this.push(polygon);
  }

  pop() {
    console.log(this.arr);
    let popped = this.arr.pop();
    console.log(popped);
    popped.delete()
    this.parent.setState({ iterable: this.getListIterable() });
    if (this.arr.length == 0){
      this.clearCircles();
    }
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
      allPolygons.push(this.arr[i].convertToLatLng());
    }

    return allPolygons;
  }
}

function createNotification(type) {
  switch (type) {
      case 'draw':
        NotificationManager.info('Draw Outer Delivery Zone','',notificationTimer);
        break;
      case 'edit':
        NotificationManager.info('Edit Delivery Zone','',notificationTimer);
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
