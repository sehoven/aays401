import React,{Component} from 'react';
import {render} from 'react-dom';

export default class HistoryPanel extends Component{
  constructor(props) {
    super(props);
  }
  render(){
    return(
      <div className="side-panel nav-panel">
        <input type="text" name="searchBar" id="search-box"
          onChange={this.onChange} />
      </div>
    )
  }
}
