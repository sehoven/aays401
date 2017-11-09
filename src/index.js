import React, { Component } from 'react';
import MapContainer from './components/MapContainer.js';
const ReactDOM = require('react-dom');

require('./styles/_style.sass');

export class Index extends Component {
  constructor(props){
    super(props);
  }

  swapState(toggle){
    this.setState({ currentPanel : toggle });
  }

  render(){
    var topButtonStyle = {};
    var bottomButtonStyle = {};
    if (this.state.currentPanel =="search") {
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
        <MapContainer />
      </div>
    )
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('app')
);
