import React, {Component} from 'react';
const ReactDOM = require('react-dom');
import Map from './components/Map.js';
import NavPanel from './components/NavPanel.js';

require('./styles/_style.sass');

export class Index extends Component {
  constructor(props){
    super(props);
    this.state = {
      mapLoaded: false,
      map: null,
      maps: null
    }
    this.setMapRef = this.setMapRef.bind(this);
  }

  setMapRef(map, maps) {
    this.setState({
      mapLoaded: true,
      map: map,
      maps: maps
    });
  }

  render(){
    return (
      <div className="fullScreen">
        { this.state.mapLoaded && <NavPanel index={this.state} /> }
        <Map setMapRef={this.setMapRef} />
      </div>
    )
  }
}
ReactDOM.render(
  <Index />,
  document.getElementById('app')
);
