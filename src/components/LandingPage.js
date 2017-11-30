import React, { Component } from 'react';
import ReactModal from 'react-modal';

import { AppBar } from './UIComponents.js';
import MapContainer from './MapContainer.js';
const HTTPService = require('./HTTPService.js');

export default class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: true
    }

    this.setAuthenticated = this.setAuthenticated.bind(this);
  }

  setAuthenticated(isAuthenticated) {
    this.setState({
      isAuthenticated: isAuthenticated
    });
  }

  render() {
    return (
      <div>
        <AppBar />
        { this.state.isAuthenticated ?
          <MapContainer /> :
          <AuthPage setAuthenticated={this.setAuthenticated}/> }
      </div>
    );
  }
}

class AuthPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      showModal: false,
      modalTitle: "",
      modalMessage: ""
    }

    this.keys = {
      username: "username",
      password: "password"
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleCloseModal () {
    this.setState({ showModal: false });
  }

  handleSubmit(event) {
    let that = this;
    const loginJson = {
      username: this.state.username,
      password: this.state.password
    }
    HTTPService.login(loginJson).then(function(res) {
      res.body.then(function(data) {
        switch(res.statusCode) {
          case 400:
            that.setState({
              modalTitle: "Login Error",
              modalMessage: data[0].reason,
              showModal: true
            });
            break;
          case 200:
            that.props.setAuthenticated(true);
            break;
          default:
            that.setState({
              modalTitle: "Unexpected Response",
              modalMessage: data[0].reason,
              showModal: true
            });
            break;
        }
      });
    });

    event.preventDefault();
  }

  handleInputChange(event) {
    if(Object.keys(this.keys).includes(event.target.name)) {
      this.setState({
        [event.target.name]: event.target.value
      });
    }
  }

  render() {
    return (
      <div>
        <form className="auth-form" onSubmit={this.handleSubmit}>
          <div className="auth-block">
            <input type="text"
                   placeholder="Username"
                   name={this.keys.username}
                   onChange={this.handleInputChange}
                   required />
          </div>
          <div className="auth-block">
            <input type="password"
                   placeholder="Password"
                   name={this.keys.password}
                   onChange={this.handleInputChange}
                   required />
          </div>
          <div className="auth-block">
            <button type="submit">Login</button>
          </div>
        </form>
        <ReactModal isOpen={this.state.showModal}
                    contentLabel="Minimal Modal Example"
                    className="modal modal-auth">
          <h2 id="modal-title">{this.state.modalTitle}</h2>
          <p id="modal-message">{this.state.modalMessage}</p>
          <button onClick={this.handleCloseModal}>OK</button>
        </ReactModal>
      </div>
    )
  }
}
