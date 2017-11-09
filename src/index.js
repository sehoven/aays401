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
      maps: null,
      currentPanel: "search"
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
  swapState(toggle){
    this.setState({ currentPanel : toggle })  ;
  }

  render(){
    var topButtonStyle = {};
    var bottomButtonStyle = {};
    if (this.state.currentPanel == "search"){
      topButtonStyle = {
        borderTop: "1px black solid",
        borderRight: "1px black solid",
        borderBottom: "1px black solid",
        backgroundColor: "white"
      }
      bottomButtonStyle = {
        borderLeft: "1px black solid",
        backgroundColor: "gray"
      }
    } else {
      topButtonStyle = {
        borderLeft: "1px black solid",
        backgroundColor: "gray"
      }
        bottomButtonStyle = {
        borderTop: "1px black solid",
        borderRight: "1px black solid",
        borderBottom: "1px black solid",
        backgroundColor: "white"
      }
    }
    return (
      <div className="fullScreen">
          <div id = "leftContainer">
            { (this.state.currentPanel == "search") &&
              <NavPanel
                index={this.state}
                overlayRef={this.overlay}
                tabsRef={this.tabs}
              />
            }
            { (this.state.currentPanel == "draw") &&
              <Overlay
                ref={instance => {this.overlay = instance}}
                map={this.state.map}
                maps={this.state.maps}
              />
            }
            <div id = "tabButtons">
              <div
                className = "tabButton"
                id = "topTabButton"
                onClick = {() => {this.swapState("search")}}
                style = { topButtonStyle }
              >
                Search
              </div>
              <div
                className = "tabButton"
                id = "bottomTabButton"
                onClick = {() => {this.swapState("draw")}}
                style = { bottomButtonStyle }
              >
                Draw
              </div>
            </div>
	      </div>
        <Map setMapRef={this.setMapRef} />
      </div>
    )
  }
}
ReactDOM.render(
  <Index />,
  document.getElementById('app')
);
