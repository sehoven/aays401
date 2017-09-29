import React, {Component} from 'react';
import { NavList } from './NavList.js';
const HTTPService = require('./HTTPService.js');

export default class NavPanel extends Component {
  constructor(props){
    super(props);
    this.state = {
      typed: '',
      autocomplete: [],
      list: {ready: false, data:[]}
    };
    this.textInput; //This links to the RAW DOM. Not virtual.
    // We should only need RAW references for the Google API, and sparingly.
    this.handleClick = this.handleClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.service;
    this.getSuggestions = this.getSuggestions.bind(this);
  }

  getSuggestions(predictions, status){
    if (status != this.props.index.state.maps.places.PlacesServiceStatus.OK) {
      console.log(this.props.index.state.maps.places.PlacesServiceStatus.OK);
      return;
    }
    this.state.autocomplete = predictions;
  }

  onChange(event){
    //Reset list
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

    if (!this.service){
      this.service = new google.maps.places.AutocompleteService();
    }
    this.service.getQueryPredictions(
      { input: event.target.value }
      , this.getSuggestions);
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
        <NavList
          index={this.props.index}
          autocomplete={this.state.autocomplete}
          data={this.state.list} />
    </div>
  }
}
