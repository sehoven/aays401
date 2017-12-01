import React, { Component } from 'react';

export class AppBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="header">
        <div className="left title">GeoFlyer</div>
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}
