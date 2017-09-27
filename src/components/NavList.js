const React = require('react');
const ReactDOM = require('react-dom');
const HTTPService = require('./HTTPService.js')

class navListItem extends React.Component {
  render(name, key){
    <div className="navbar-list-item" key={key}>
    {name}
    </div>
  }
}

export class NavList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      data: []
    }
  }

  componentDidMount() {
    let that = this;
    HTTPService.getNearby(5, 5, 128).then(function(array){
      that.setState({
        ready: true,
        data: array
      });
    });
  }

  render() {
    if (!this.state.ready){
      return <div id="navbar-list">Loading...</div>
    } else {
      console.log(this.state.data);
      return (
        <div id="navbar-list">{this.state.data.map((itemData, i) =>
          <div className="navbar-list-item" key={i}>{itemData.name}</div>
        )}</div>
      );
    }
  }
}
