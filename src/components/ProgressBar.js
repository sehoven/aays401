import 'rc-steps/assets/index.css';
import 'rc-steps/assets/iconfont.css';
import React, { Component } from 'react';
import Steps, { Step } from 'rc-steps';

export default class ProgressBarView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: this.props.data
    }
  }

  render() {
    return (
      <div>
        <Steps labelPlacement="vertical" current={this.state.index()}>
          <Step title="draw outer polygon" />
          <Step title="draw inner polygons" />
          <Step title="export polygon images" />
        </Steps>
      </div>
    )
  }
};
