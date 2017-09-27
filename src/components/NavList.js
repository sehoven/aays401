const React = require('react');
const ReactDOM = require('react-dom');
const HTTPService = require('./HTTPService.js');

export class NavList extends React.Component {
  render() {
    if (!this.props.data.ready){
      return <div id="navbar-list">Loading...</div>
    } else {
      return (
        <div id="navbar-list">{this.props.data.data.map((itemData, i) =>
          <div className="navbar-list-item" key={i}>{itemData.name}</div>
        )}</div>
      );
    }
  }
}
