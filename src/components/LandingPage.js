import React, { Component } from 'react';
import ReactModal from 'react-modal';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
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
          <PostAuthPage /> :
          <AuthPage PanelType={PanelType}
                    setAuthenticated={this.setAuthenticated}/> }
      </div>
    );
  }
}

class PostAuthPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newPartition: false,
      showSaved: false,
      savedRows: []
    }

    this.newPartition = this.newPartition.bind(this);
    this.toggleLoadPartition = this.toggleLoadPartition.bind(this);
    this.generateRows = this.generateRows.bind(this);
  }

  newPartition() {
    this.setState({
      newPartition: true
    });
  }

  toggleLoadPartition() {
    if(!this.state.showSaved) {
      this.setState({savedRows: this.generateRows(0, 10)});
    }
    this.setState((prevState) => (
      { showSaved: !prevState.showSaved }
    ));
  }

  handleClick(i) {
    console.log("Row " + i + " clicked");
  }

  generateRows(start, end) {
    let tableRows = [];

    for(let i = start; i < end; ++i) {
      tableRows.push(
        <tr key={i} onClick={() => this.handleClick(i)}>
          <td>{i}</td>
          <td>TEST</td>
        </tr>
      );
    }

    return tableRows;
  }

  render() {
    let rowComponents = this.generateRows(0, 10);
    return (
      <div className="under-header">
        { this.state.newPartition ?
          <MapContainer /> :
          <div className="post-auth">
            <div className="default-margin">
              <button className="post-auth-button center-horizontal"
                      onClick={this.newPartition}>
                New Partition
              </button>
            </div>
            <div className="default-margin">
              <button className="post-auth-button center-horizontal"
                      onClick={this.toggleLoadPartition}>
                Load Partition
              </button>
              { this.state.showSaved ?
                <div>
                <ReactCSSTransitionGroup
                 transitionName="fade"
                 transitionAppear={true}
                 transitionAppearTimeout={500}
                 transitionEnterTimeout={500}
                 transitionLeaveTimeout={500}>
                <table id="saved-partitions" className="center-horizontal">
                  <thead>
                    <tr>
                      <th>Time Stamp</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <ReactCSSTransitionGroup
                    transitionName="fade"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}
                    transitionAppearTimeout={500}
                    transitionAppear={true}
                    component="tbody">
                    { rowComponents }
                  </ReactCSSTransitionGroup>
                </table>
                </ReactCSSTransitionGroup>
                <div className="default-margin">
                  <button className="post-auth-button center-horizontal"
                          onClick={() => {console.log("should add rows")}}>
                    Load More
                  </button>
                </div>
                </div> : null }
            </div>
          </div>
        }
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
      confirmPassword: "",
      email: "",
      passMismatch: false,
      currentPanel: this.props.PanelType.LOGIN,
      showModal: false,
      modalTitle: "",
      modalMessage: ""
    }

    this.keys = {
      email: "email",
      username: "username",
      password: "password",
      confirmPassword: "confirmPassword"
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
        this.signup(() => {
          this.setState({
            modalTitle: "Validation Required",
            modalMessage: "You have been signed up but your account must be " +
                          "validated by a system administrator before your " +
                          "account can be used.",
            showModal: true
          });
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
    if(event.target.name == this.keys.confirmPassword) {
      if(this.state.password != event.target.value) {
        this.setState({
          passMismatch: true
        });
      } else {
        this.setState({
          passMismatch: false
        });
      }
    } else if(event.target.name == this.keys.password) {
      if(this.state.confirmPassword != "" && this.state.confirmPassword != event.target.value) {
        this.setState({
          passMismatch: true
        });
      } else {
        this.setState({
          passMismatch: false
        });
      }
    }
  }

  clearAllInput() {
    this.setState({
      username: "",
      password: "",
      confirmPassword: "",
      email: ""
    });
  }

  swapState(toggle){
    this.clearAllInput();
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

  signup(successCallback) {
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
            successCallback();
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
          { this.state.currentPanel == this.props.PanelType.SIGNUP ?
          <div className="auth-block">
            <input className={this.state.passMismatch ? "mismatch" : ""}
                   value={this.state.confirmPassword}
                   type="password"
                   placeholder=" Confirm Password"
                   name={this.keys.confirmPassword}
                   onChange={this.handleInputChange}
                   required />
            { this.state.passMismatch ?
              <p className="warning">Passwords do not match.</p> : null}
          </div> : null }
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
