import React, {Component} from 'react';
import { NavList } from './NavList.js';
const HTTPService = require('./HTTPService.js');

export default class NavPanel extends Component {
  constructor(props){
    super(props);
    this.state = {
      typed: '',
      list: {ready: false, data:[]}
    };
    this.textInput; //This links to the RAW DOM. Not virtual.
    // We should only need RAW references for the Google API, and sparingly.
    this.handleClick = this.handleClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event){
    this.setState({
      typed: event.target.value,
      list: {ready: false, data:[]}
    });
    let that = this;
    HTTPService.searchLists(event.target.value).then(function(array){
      that.setState({
        list: {ready: true, data: array}
      });
    });
  }

  handleClick(){
    this.props.index.state.shared(this.state.typed, this.textInput);
  }

  render() {
    return <div id="navpanel">
        <input type="text" name="searchBar" id="search-box"
          onChange={this.onChange}
          ref={(input) => {this.props.index.state.textInput = input; }} />
        <input type="button" value="Search" id="search-button"
          onClick={this.handleClick} />
        <NavList data={this.state.list}/>
    </div>
  }
}
