import React, { Component } from 'react';
import NavPanel from './NavPanel.js';
import OverlayContainer from './Overlay';

export default class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPanel: this.props.PanelType.SEARCH,
      overlay: null
    }
  }

  componentDidMount(){
    this.setState({ overlay: this.overlay })
  }

  swapState(toggle){
    this.setState({ currentPanel : toggle });
  }

  injectNeighborhood(polygon){
    this.setState({ currentPanel : this.props.PanelType.DRAW });
    this.overlay.resetPolygon();
    let polygonList = this.overlay.state.polygons;
    polygonList.add(polygon);
    this.overlay.setState({ polygons: polygonList});
    this.overlay.updatePolygonData();
  }

  render() {
    const { currentPanel } = this.state;
    return (
      <div id="leftContainer">
        <NavPanel
          map={this.props.map}
          maps={this.props.maps}
          active={ currentPanel == this.props.PanelType.SEARCH }
          overlayRef={this.state.overlay}
          tabsRef={this} />
        <OverlayContainer
          ref={(instance) => {this.overlay = instance}}
          active={ currentPanel == this.props.PanelType.DRAW }
          map={this.props.map}
          maps={this.props.maps} />
        <div id="tabButtons">
          <div
            className= {
              "tabButton " +
              ((currentPanel == this.props.PanelType.SEARCH) ? "activeTabButton" : "")
            }
            id="search-tab"
            onClick={() => { this.swapState(this.props.PanelType.SEARCH) }} >
            <div className="buttonText"><p>Search</p></div>
          </div>
          <div
            className={
              "tabButton " +
              ((currentPanel == this.props.PanelType.DRAW) ? "activeTabButton" : "")
            }
            id="draw-tab"
            onClick={() => { this.swapState(this.props.PanelType.DRAW) }} >
            <div className="buttonText"><p>Draw</p></div>
          </div>
        </div>
      </div>
    )
  }
}
