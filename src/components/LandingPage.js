import React, { Component } from 'react';
import { AppBar } from './UIComponents.js';
import MapContainer from './MapContainer.js';

export default class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false
    }
  }

  render() {
    const authPage = <div><AppBar />AUTHENTICATE</div>;
    return (
      <div>
        <AppBar />
        { this.state.isAuthenticated ?
          <MapContainer /> :
          <AuthPage /> }
      </div>
    );
  }
}

class AuthPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <form className="auth-form">
          <div className="auth-block">
            <input type="text" placeholder="Username" name="uname" required />
          </div>
          <div className="auth-block">
            <input type="password" placeholder="Password" name="psw" required/>
          </div>
          <div className="auth-block">
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    )
  }
}
