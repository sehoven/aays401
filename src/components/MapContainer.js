import React, { Component } from 'react';
import { AppBar } from './UIComponents.js';
import Map from './Map.js'
import Tabs from './Tabs';
import {Enum} from 'enumify';

class PanelType extends Enum {}
PanelType.initEnum(['SEARCH', 'DRAW']);

/*================================
Receives a pointer to setMapRef method in index.js for callback
to set map references to be used by Map.js and NavPanel.js.
================================*/
export default class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapLoaded: false,
      map: null,
      maps: null
    }
  }

  setMapRef(map, maps) {
    this.setState({
      mapLoaded: true,
      map: map,
      maps: maps
    });
  }

  render() {
    return (
      <div>
        <div className="container">
          <div className="left">
            { this.state.mapLoaded &&
              <Tabs
                map={this.state.map}
                maps={this.state.maps}
                PanelType={PanelType} setProgressState={this.props.setProgressState}/>
            }
          </div>
          <div className="right">
            <Map setMapRef={this.setMapRef.bind(this)} />
          </div>
        </div>
      </div>
    )
  }
}
