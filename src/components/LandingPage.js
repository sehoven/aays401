import React, { Component } from 'react';
import ReactModal from 'react-modal';
import { Enum } from 'enumify';

import { AppBar } from './UIComponents.js';
import MapContainer from './MapContainer.js';
const HTTPService = require('./HTTPService.js');

class PanelType extends Enum {}
PanelType.initEnum(['LOGIN', 'SIGNUP']);

export default class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false
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
          <AuthPage PanelType={PanelType}
                    setAuthenticated={this.setAuthenticated}/> }
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
      email: "",
      currentPanel: this.props.PanelType.LOGIN,
      showModal: false,
      modalTitle: "",
      modalMessage: ""
    }

    this.keys = {
      email: "email",
      username: "username",
      password: "password"
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleCloseModal () {
    this.setState({
      showModal: false,
      modalTitle: "",
      modalMessage: ""
    });
  }

  handleSubmit(event) {
    switch(this.state.currentPanel) {
      case this.props.PanelType.LOGIN:
        this.login();
        break;
      case this.props.PanelType.SIGNUP:
        this.signup();
        this.setState({
          modalTitle: "One more thing...",
          modalMessage: "You have been signed up but your account must be " +
                        "validated by a system administrator before your " +
                        "account can be used.",
          showModal: true
        });
        break;
    }
    event.preventDefault();
  }

  handleInputChange(event) {
    if(Object.keys(this.keys).includes(event.target.name)) {
      this.setState({
        [event.target.name]: event.target.value
      });
    }
  }

  clearAllInput() {
    this.setState({
      username: "",
      password: "",
      email: ""
    });
  }

  swapState(toggle){
    this.setState({ currentPanel : toggle });
  }

  login() {
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
  }

  signup() {
    let that = this;
    const signupJson = {
      email: this.state.email,
      username: this.state.username,
      password: this.state.password
    }
    HTTPService.signup(signupJson).then(function(res) {
      res.body.then(function(data) {
        switch(res.statusCode) {
          case 400:
            that.setState({
              modalTitle: "SignUp Error",
              modalMessage: data[0].reason,
              showModal: true
            });
            break;
          case 200:
            //modal window
            that.clearAllInput();
            that.swapState(that.props.PanelType.LOGIN);
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
  }

  render() {
    const { currentPanel } = this.state;
    return (
      <div className="auth-container">
        <div className="tabButtons">
        <div
          className= {
            "tabButton " +
            ((currentPanel == this.props.PanelType.LOGIN) ? "activeTabButton" : "")
          }
          id="login-tab"
          onClick={() => { this.swapState(this.props.PanelType.LOGIN) }} >
          <div><p>LOGIN</p></div>
        </div>
        <div
          className={
            "tabButton " +
            ((currentPanel == this.props.PanelType.SIGNUP) ? "activeTabButton" : "")
          }
          id="signup-tab"
          onClick={() => { this.swapState(this.props.PanelType.SIGNUP) }} >
          <div><p>SIGN UP</p></div>
        </div>
        </div>
        <form className="auth-form" onSubmit={this.handleSubmit}>
          { this.state.currentPanel == this.props.PanelType.SIGNUP ?
          <div className="auth-block">
            <input value={this.state.email}
                   type="email"
                   placeholder="Email"
                   name={this.keys.email}
                   onChange={this.handleInputChange}
                   required />
          </div> : null }
          <div className="auth-block">
            <input value={this.state.username}
                   type="text"
                   placeholder="Username"
                   name={this.keys.username}
                   onChange={this.handleInputChange}
                   required />
          </div>
          <div className="auth-block">
            <input value={this.state.password}
                   type="password"
                   placeholder="Password"
                   name={this.keys.password}
                   onChange={this.handleInputChange}
                   required />
          </div>
          <div className="auth-block">
            <button>
              {this.state.currentPanel == this.props.PanelType.SIGNUP ? "SIGN UP" : "LOGIN" }
            </button>
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
