import React, { Component } from 'react';
import NavPanel from './NavPanel.js';
import OverlayContainer from './Overlay';

export default class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPanel: "search"
    }
  }

  swapState(toggle){
    this.setState({ currentPanel : toggle });
  }

  render() {
    var topButtonStyle = {};
    var bottomButtonStyle = {};
    if (this.state.currentPanel == "search") {
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
      <div id="leftContainer">
        { (this.state.currentPanel == "search") &&
          <NavPanel
            map={this.props.map}
            maps={this.props.maps}
            index={this.state}
            overlayRef={this.overlay}
            tabsRef={this.tabs}
          />
        }
        { (this.state.currentPanel == "draw") &&
          <OverlayContainer
            ref={instance => {this.overlay = instance}}
            map={this.props.map}
            maps={this.props.maps}
          />
        }
        <div id="tabButtons">
          <div
            className="tabButton"
            id="topTabButton"
            onClick={() => { this.swapState("search") }}
            style={ topButtonStyle }
          >
            <div className="buttonText"><p>Search</p></div>
          </div>
          <div
            className="tabButton"
            id="bottomTabButton"
            onClick={() => { this.swapState("draw") }}
            style={ bottomButtonStyle }
          >
            <div className="buttonText"><p>Draw</p></div>
          </div>
        </div>
      </div>
    )
  }
}
