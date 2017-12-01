import React, { Component } from 'react';

export class AppBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="header">
        <div className="left">AaYS</div>
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}
//data={this.progressBarData.bind(this)}
