import React, {Component} from 'react';
import { NavList } from './NavList.js';
const HTTPService = require('./HTTPService.js');

/*================================
Receives a pointer to the index.js object in props
================================*/
export default class NavPanel extends Component {
  constructor(props){
    super(props);
    this.state = {
      autocomplete: [],
      list: {ready: true, data:[]}
    };
    this.onChange = this.onChange.bind(this);
    this.AutocompleteService;
  }

  //Fires when the search bar's text changes, unless it is emptied.
  onChange(event){
    if (event.target.value != ''){
      this.setState({
        list: {ready: false, data: []}
      });
      let that = this;
      HTTPService.searchLists(event.target.value).then(function(array){
        that.setState({
          list: {ready: true, data: array}
        });
      });

      if (!this.AutocompleteService){
        this.AutocompleteService = new google.maps.places.AutocompleteService();
      }
      this.AutocompleteService.getQueryPredictions(
        { input: event.target.value },
        function(predictions, status) {
          let maps = that.props.index.maps;
          if (status != maps.places.PlacesServiceStatus.OK) {
            return;
          }
          that.state.autocomplete = predictions;
        });
    }
  }

  render() {
    return <div id="navpanel">
        <input type="text" name="searchBar" id="search-box"
          onChange={this.onChange} />
        <NavList
          index={this.props.index}
          autocomplete={this.state.autocomplete}
          data={this.state.list} />
    </div>
  }
}
