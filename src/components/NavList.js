import React, {Component} from 'react';
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
        let scaleFactor = (size*0.9)/Math.max(item.width, item.height);
        let xx = (size/2) + (item.points[0].lat - item.center.lat) * scaleFactor;
        let yy = (size/2) + (item.points[0].lng - item.center.lng) * scaleFactor;
        context.moveTo(xx, yy);
        context.beginPath();
        for (let i = 1; i < item.points.length; i += 1){
          let xx = (size/2) + (item.points[i].lat - item.center.lat) * scaleFactor;
          let yy = (size/2) + (item.points[i].lng - item.center.lng) * scaleFactor;
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
    if (this.willInject){
      this.polygon = null;
    } else {
      if (this.polygon) this.polygon.setMap(null);
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
      map.setZoom(11);
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
    let that = this;
    // HTTPService.countPolyResidences(itemData).then(function(json){
    //   let dataList = that.props.overlayRef.state.data == null ? that.props.overlayRef.state.data : [];
    //   dataList.push(json);
    //   that.props.overlayRef.setState({dataReady: true, data: dataList});
    // });
    if (this.polygon){
      this.polygon.setMap(null);
    }
    this.polygon = new this.props.maps.Polygon({
          paths: itemData.points,
          strokeWeight: 0,
          fillOpacity: 0.45,
          zIndex: 1
    });
    this.polygon.setMap(map);
    that.willInject = true;
    that.props.tabsRef.injectNeighborhood(this.polygon);
  }

  render() {
    if (!this.props.data.ready){
      return <div id="navbar-list">Loading...</div>
    } else {
      return (
        <div id="navbar-list">
          {this.props.autocomplete.map((itemData, i) =>
            <div className="navbar-list-autocomplete-item"
              key={i}
              onClick={
                () => {this.centerMapOnId(this.props.placeIds[i].place_id)}
            }>
              <div className="navbar-list-autocomplete-text">
                {itemData}
              </div>
            </div>
        )}
        {this.props.data.data.map((itemData, i) =>
          <div className="navbar-list-item"

            key={i}
            onClick={
              () => { this.neighbourhoodClicked(itemData.center, itemData) }
          }>
            <IconCanvas key={i} item={itemData} />
            <div className="navbar-list-text"><p>{itemData.name}</p></div>
          </div>
        )}
        </div>
      );
    }
  }
}
