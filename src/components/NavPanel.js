import React, {Component} from 'react';
import { NavList } from './NavList.js';

export class NavPanel extends Component {
  render() {
    return <div id="navpanel">
        <input type="text" name="searchBar" id="search-box" />
        <input type="button" value="Search" id="search-button" />
        <NavList />
    </div>
  }
}
