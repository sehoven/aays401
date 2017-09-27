import React, {Component} from 'react';
import { NavList } from './NavList.js';
const HTTPService = require('./HTTPService.js');

export class NavPanel extends Component {
  constructor(props){
    super(props);
    this.state = {
      typed: '',
      list: {ready: false, data:[]}
    }
  }

  onChange(event){
    this.setState({
      list: {ready: false, data:[]}
    });
    let that = this;
    HTTPService.searchLists(event.target.value).then(function(array){
      that.setState({
        list: {ready: true, data: array}
      });
    });
  }

  render() {
    return <div id="navpanel">
        <input type="text" name="searchBar" id="search-box" onChange={this.onChange.bind(this)} />
        <input type="button" value="Search" id="search-button" />
        <NavList data={this.state.list}/>
    </div>
  }
}
