import React, { Component } from 'react';
import LandingPage from './components/LandingPage.js';
const ReactDOM = require('react-dom');

require('./styles/_style.sass');

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
