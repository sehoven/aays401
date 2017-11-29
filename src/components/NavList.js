import React, {Component} from 'react';
import ReactLoading from 'react-loading';

const HTTPService = require('./HTTPService.js');

/*================================
Receives a pointer to the index.js object, and two lists:
autocomplete, data in props
================================*/
class IconCanvas extends Component {
  componentDidMount() {
    this.updateCanvas();
  }

  // If looking for performance bottlenecks, look here
  updateCanvas() {
    let size = 100;
    const context = this.refs.canvas.getContext("2d");

    if (context != null) {
      let item = this.props.item;
      let points = item.points;
      let scaleFactor = (size*0.9)/Math.max(item.height * 0.59, item.width);
      let yy = (size/2) + (item.center.lat - points[0].lat) * scaleFactor;
      let xx = (size/2) + (points[0].lng - item.center.lng) * scaleFactor * 0.59;
      context.moveTo(xx, yy);
      context.beginPath();
      for (let i = 1; i < points.length; i += 1){
        let yy = (size/2) + (item.center.lat - points[i].lat) * scaleFactor;
        let xx = (size/2) + (points[i].lng - item.center.lng) * scaleFactor * 0.59;
        context.lineTo(xx, yy);
      }
      context.closePath();
      context.fillStyle = "rgb(150,150,255)";
      context.lineWidth = 2;
      context.strokeStyle = "black";
      context.fill();
      context.stroke();
    }
  }

  render() {
    return (
      <canvas
      className="navbar-list-icon"
      ref="canvas"
      width="100"
      height="100" />
    );
  }
}

export default class NavList extends React.Component {
  constructor(props){
    super(props);
    this.geocoder;
    this.polygon;
    this.markers = [];
    this.willInject = false;
  }

  componentWillUnmount(){
    if (this.willInject) {
      this.polygon = null;
    } else {
      if (this.polygon) {
        this.polygon.setMap(null);
      }
    }
  }

  centerMapOnId(placeId){
    if (!this.geocoder){
      this.geocoder = new this.props.maps.Geocoder();
    }
    let map = this.props.map;
    this.geocoder.geocode({'placeId': placeId}, function(results, status) {
      if (status !== 'OK') {
        console.log('Geocoder failed due to: ' + status);
        return;
      }
      map.setZoom(17);
      map.setCenter(results[0].geometry.location);
    });
  }


  neighbourhoodClicked(center, itemData){
    let map = this.props.map;
    let baseZoom = 9;
    let radiusZoomWeight = 1.1;
    let polygonZoomVariation = Math.log2(radiusZoomWeight * itemData.radius);
    let viewportZoomFactor = 1;
    let zoomFactor = (baseZoom - polygonZoomVariation) * viewportZoomFactor
    map.setZoom(Math.floor(zoomFactor));
    map.setCenter(center);

    if (this.polygon) {
      this.polygon.setMap(null);
    }
    this.polygon = new this.props.maps.Polygon({
      paths: itemData.points,
      strokeColor: '#000000',
      strokeWeight: 1,
      fillOpacity: 0.1,
      zIndex: 1
    });
    this.polygon.setMap(map);
    this.willInject = true;
    this.props.tabsRef.injectNeighborhood(this.polygon);
  }

  render() {
    // There is a loading spinner component but it doesn't seem to load fast enough to be seen
    // <ReactLoading className="center-horizontal" type={"spin"} color={"#888"} height="100px" width="100px"/>
    // Try replacing "Loading..." with the line above to try it
    if (!this.props.data.ready){
      return (
        <div id="navbar-list">
          Loading...
        </div>
      )
    } else {
      return (
        <div id="navbar-list">
          {this.props.autocomplete.map((itemData, i) =>
            <div className="navbar-list-autocomplete-item"
            key={i}
            onClick={
              () => {this.centerMapOnId(this.props.placeIds[i].place_id)}
            }>
              <div className="navbar-list-autocomplete-text">{itemData}</div>
            </div>
          )}
          {this.props.data.data.map((itemData, i) =>
            <div className="navbar-list-item"
            key={i}
            onClick={
              () => { this.neighbourhoodClicked(itemData.center, itemData) }
            }>
              <IconCanvas key={i} item={itemData} />
              <div className="navbar-list-text">{itemData.name}</div>
            </div>
          )}
        </div>
      );
    }
  }
}
