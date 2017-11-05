import React, {Component} from 'react';
const ReactDOM = require('react-dom');
import Map from './components/Map.js';
import NavPanel from './components/NavPanel.js';
import Tabs from './components/Tabs.js'
import Overlay, { DrawingTools } from './components/Overlay.js';
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
        <div className="container">
          <Tabs className="container" ref = {instance => {this.tabs = instance}}>
            <div name="search">
              <NavPanel
                index={this.state}
                overlayRef={this.overlay}
                tabsRef={this.tabs}
              />
            </div>
            <div name="polygon">
              <Overlay
                ref={instance => {this.overlay = instance}}
                map={this.state.map}
                maps={this.state.maps}
              />
            </div>
          </Tabs>
          <Map setMapRef={this.setMapRef} />
	      </div>
      </div>
    )
  }
}
ReactDOM.render(
  <Index />,
  document.getElementById('app')
);
