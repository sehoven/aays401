import React, {Component} from 'react';
const ReactDOM = require('react-dom');
import Map from './components/Map.js';
import NavPanel from './components/NavPanel.js';

require('./styles/_style.sass');

export class Index extends Component {
  constructor(props){
    super(props);
    this.state = {
      map: '',
      textInput: '',
      shared: ''
    }
  }
  render(){
    return <div id="map"><NavPanel index={this} /><Map index={this} /></div>
  }
}
ReactDOM.render(
  <Index />,
  document.getElementById('app')
);
