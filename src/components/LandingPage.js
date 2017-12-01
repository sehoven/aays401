import React, { Component } from 'react';
import ReactModal from 'react-modal';
import { Enum } from 'enumify';
import { AppBar } from './UIComponents.js';
import MapContainer from './MapContainer.js';
const HTTPService = require('./HTTPService.js');
import ProgressBarView from './ProgressBar.js';
import SteppedProgressBar from 'patchkit-stepped-progress-bar';

class PanelType extends Enum {}
PanelType.initEnum(['LOGIN', 'SIGNUP']);

export default class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      isAuthenticated: false
    }
    this.setAuthenticated = this.setAuthenticated.bind(this);
    this.logout = this.logout.bind(this);
  }

  logout(){
    document.cookie = 'authToken=;';
    this.setState({ isAuthenticated: false });
  }

  componentWillMount() {
    let that = this;
    HTTPService.userAuthCheck().then(function(json){
      that.setState({isAuthenticated: json[0].value || false, isReady: true});
    });
  }

  setAuthenticated() {
    this.setState({
      isAuthenticated: true,
      isReady: true
    });
  }

  progressBarData() {
    return 0;
    // TODO
    // This function should derive its state from the overlay class
  }

  render() {
    if (this.state.isReady) {
      if (this.state.isAuthenticated){
        return (
          <div>
            <AppBar>
              <div className="app-bar-child">
                <ProgressBarView data={this.progressBarData.bind(this)} />
              </div>
              <div id="logout" onClick={() => {this.logout()}}>LOGOUT</div>
            </AppBar>
            <MapContainer />
          </div>
        )
      } else {
        return <div><AppBar /><AuthPage PanelType={PanelType}
                            setAuthenticated={this.setAuthenticated}/></div>
      }
    } else {
      return <AppBar />;
    }
  }
}

export class AuthPage extends Component {
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

  errorCallback(title, message) {
    this.setState({
      modalTitle: title,
      modalMessage: message,
      showModal: true
    });
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
    HTTPService.login(loginJson).catch(function(err) {
      that.errorCallback(err.name, err.message);
    }).then(function(res) {
      if(res && res.body) {
        res.body.then(function(data){
          switch(res.statusCode) {
            case 400:
              that.setState({
                modalTitle: "Login Error",
                modalMessage: data[0].reason,
                showModal: true
              });
              break;
            case 200:
              that.props.setAuthenticated();
              document.cookie = data[0].pseudoCookie;
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
      } else {
        that.errorCallback("Error", "Login attempt yielded no response.");
      }
    });
  }

  signup(successCallback) {
    let that = this;
    const signupJson = {
      email: this.state.email,
      username: this.state.username,
      password: this.state.password
    }
    HTTPService.signup(signupJson).catch(function(err) {
      that.errorCallback(err.name, err.message);
    }).then(function(res) {
      if(res && res.body) {
        res.body.then(function(data) {
          switch(res.statusCode) {
            case 400:
              that.errorCallback("SignUp Error", data[0].reason)
              break;
            case 200:
              //modal window
              that.clearAllInput();
              that.swapState(that.props.PanelType.LOGIN);
              if(successCallback != null) {
                successCallback();
              }
              break;
            default:
              that.errorCallback("Unexpected Response", data[0].reason);
              break;
          }
        });
      } else {
        that.errorCallback("Error", "Signup attempt yielded no response.")
      }
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
            <button disabled={this.state.passMismatch}>
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
