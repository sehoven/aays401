import React, { Component } from 'react';
import NavPanel from './NavPanel.js';
import OverlayContainer from './Overlay';
import Tabs from './Tabs.js';

export default class TabsContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Tabs ref={instance => {this.tabs = instance}}>
        <div name="search">
          <NavPanel
            map={this.props.map}
            maps={this.props.maps}
            overlayRef={this.overlay}
            tabsRef={this.tabs} />
        </div>
        <div name="polygon">
          <OverlayContainer
            ref={instance => {this.overlay = instance}}
            map={this.props.map}
            maps={this.props.maps} />
        </div>
      </Tabs>
    )
  }
}
