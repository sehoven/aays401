import React, { Component } from 'react';
import LandingPage from './components/LandingPage.js';
const ReactDOM = require('react-dom');
const HTTPService = require('./components/HTTPService.js');
require('./styles/_style.sass');
var isLoggedin;


export class Index extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
      <LandingPage />
    )
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('app')
);
