import React, { Component } from 'react';
import NavPanel from './NavPanel.js';
import OverlayContainer from './Overlay';
import {Enum} from 'enumify';

class PanelType extends Enum {}
PanelType.initEnum(['SEARCH', 'DRAW']);

export default class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPanel: PanelType.SEARCH
    }
  }

  swapState(toggle){
    this.setState({ currentPanel : toggle });
  }

  render() {
    const { currentPanel } = this.state;
    return (
      <div id="leftContainer">
        <NavPanel
          map={this.props.map}
          maps={this.props.maps}
          active = { currentPanel == PanelType.SEARCH }
          overlayRef={this.overlay}
          tabsRef={this.tabs}
        />
        <OverlayContainer
          ref={instance => {this.overlay = instance}}
          active = { currentPanel == PanelType.DRAW }
          map={this.props.map}
          maps={this.props.maps}
        />
        <div id="tabButtons">
          <div
            className= {
              "tabButton " +
              ((currentPanel == PanelType.SEARCH)?"activeTabButton":"")
            }
            id="topTabButton"
            onClick={() => { this.swapState(PanelType.SEARCH) }}
          >
            <div className="buttonText"><p>Search</p></div>
          </div>
          <div
            className={
              "tabButton " +
              ((currentPanel == PanelType.DRAW)? "activeTabButton":"")
            }
            id="bottomTabButton"
            onClick={() => { this.swapState(PanelType.DRAW) }}
          >
            <div className="buttonText"><p>Draw</p></div>
          </div>
        </div>
      </div>
    )
  }
}
