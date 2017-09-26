const React = require('react');
const ReactDOM = require('react-dom');
const fetch = require('node-fetch');

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
