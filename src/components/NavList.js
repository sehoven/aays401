const React = require('react');
const ReactDOM = require('react-dom');
const HTTPService = require('./HTTPService.js');

class IconCanvas extends React.Component {
    componentDidMount() {
        this.updateCanvas();
    }

    //If looking for performance bottlenecks, look here
    updateCanvas() {
      let size = 100;
      const context = this.refs.canvas.getContext('2d');
      let item = this.props.item;
      let points = item.points;

      let scaleFactor = (size*0.9)/Math.max(item.width, item.height);
      let xx = (size/2) + (points[0].lat - item.center.lat) * scaleFactor;
      let yy = (size/2) + (points[0].lng - item.center.lng) * scaleFactor;
      context.moveTo(xx, yy);
      context.beginPath();
      for (let i = 1; i < points.length; i += 1){
        let xx = (size/2) + (points[i].lat - item.center.lat) * scaleFactor;
        let yy = (size/2) + (points[i].lng - item.center.lng) * scaleFactor;
        context.lineTo(xx, yy);
      }
      context.closePath();
      context.fillStyle = "rgb(150,150,255)";
      context.lineWidth = 2;
      context.strokeStyle = "black";
      context.fill();
    	context.stroke();
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

export class NavList extends React.Component {
  constructor(props){
    super(props);
    this.geocoder;
  }

  centerMapOnId(placeid){
    if (!this.geocoder){
       this.geocoder = new google.maps.Geocoder;
    }
    let map = this.props.index.state.map;
    this.geocoder.geocode({'placeId': placeid}, function(results, status) {
      if (status !== 'OK') {
        console.log('Geocoder failed due to: ' + status);
        return;
      }
      map.setZoom(11);
      map.setCenter(results[0].geometry.location);
    });
  }

  centerMapByGeocode(center){
    let map = this.props.index.state.map;
    let maps = this.props.index.state.maps;
    map.setZoom(14);
    map.setCenter(center);
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
              onClick={() => { this.centerMapOnId(itemData.place_id)}}>
            <div className="navbar-list-autocomplete-icon"></div>
            <div className="navbar-list-autocomplete-text">
              {itemData.description}
            </div>
          </div>
        )}
        {this.props.data.data.map((itemData, i) =>
          <div className="navbar-list-item"
          key={i}
          onClick={() => { this.centerMapByGeocode(itemData.center)}}>
            <IconCanvas key={i} item={itemData} />
            <div className="navbar-list-text">{itemData.name}</div>
          </div>
        )}
        </div>
      );
    }
  }
}//git commit -m "Fixed incorrect neighbourhood centers in json data.\nRemoved default google autocomplete.\nAdded neighbourhood polygon previews.\nAdded custom autocomplete above neighbourhood list.\nAdded list scrolling.\nAdded zoom to geocode function to list."
