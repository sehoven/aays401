import React, {Component} from 'react';
import NavList from './NavList.js';
const HTTPService = require('./HTTPService.js');
const locality = "Edmonton Canada";

/*================================
Receives a pointer to map object in props
================================*/
export default class NavPanel extends Component {
  constructor(props){
    super(props);
    this.state = {
      autocomplete: [],
      placeIds: [],
      list: {ready: true, data:[]}
    };
    this.onChange = this.onChange.bind(this);
    this.AutocompleteService;
  }
  // Fires when the search bar's text changes, unless it is emptied.
  onChange(event) {
    if(event.target != null && event.target.value != ""){
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
      let searchtext = event.target.value + " " + locality;

      this.AutocompleteService.getQueryPredictions(
        {input:searchtext},
        function(predictions, status) {
          if (status != that.props.maps.places.PlacesServiceStatus.OK) {
            return;
          }
          let results = predictions.map(
          function(x){
            return x.terms[0].value
                    + (x.terms.length>1?(", " + x.terms[1].value):"");
          });
          that.setState({
            autocomplete: results,
            placeIds: predictions
          });
        });
    }
  }

  render() {
    if (!this.props.active) return null;
    return (
      <div className="nav-panel">
        <input type="text" id="search-box"
          onChange={this.onChange} />
        <NavList
          map={this.props.map}
          maps={this.props.maps}
          autocomplete={this.state.autocomplete}
          placeIds={this.state.placeIds}
          data={this.state.list}
          tabsRef={this.props.tabsRef} />
      </div>
    )
  }
}
