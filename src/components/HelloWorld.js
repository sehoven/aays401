// An example of a component that can query a JSON server for data.
// No source for this one, but further work can be done with fetch api.
var React = require('react');
var ReactDOM = require('react-dom');
var fetch = require('node-fetch');

export class Fetch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      string: ''
    }
  }

  componentDidMount() {
    var that = this;
    fetch('http://localhost:3000/HelloWorld')
    	.then(function(response) { return response.json(); })
    	.then(function(data) { that.setState( { string: data.text } ) })
  }

  render() {
    return (
        <h1>
          { this.state.string }
        </h1>
    );
  }
}
