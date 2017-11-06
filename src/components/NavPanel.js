import React, {Component} from 'react';
import { NavList } from './NavList.js';
const HTTPService = require('./HTTPService.js');

/*================================
Receives a pointer to map object in props
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

  // Fires when the search bar's text changes, unless it is emptied.
  onChange(event) {
    if(event.target.value != null && event.target.value != ""){
      this.setState({
        list: {ready: false, data: []}
      });

      let that = this;
      HTTPService.searchLists(event.target.value).then(function(array){
        that.setState({
          list: {ready: true, data: array}
        });
      });

      if(!this.AutocompleteService){
        this.AutocompleteService = new google.maps.places.AutocompleteService();
      }
      this.AutocompleteService.getQueryPredictions(
        { input: event.target.value },
        function(predictions, status) {
          if(status != that.props.maps.places.PlacesServiceStatus.OK) {
            return;
          }
          that.setState({ autocomplete: predictions});
        }
      );
    }
  }

  render() {
    return (
      <div className="side-panel nav-panel">
        <input type="text" name="searchBar" id="search-box"
          onChange={this.onChange} />
        <NavList
          map={this.props.map}
          maps={this.props.maps}
          autocomplete={this.state.autocomplete}
          data={this.state.list}
          tabsRef={this.props.tabsRef}
          overlayRef={this.props.overlayRef} />
      </div>
    )
  }
}
