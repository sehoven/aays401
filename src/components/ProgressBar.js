import React, { Component } from 'react';
import SteppedProgressBar from 'patchkit-stepped-progress-bar';

export default class ProgressBarView extends Component {
  constructor(props) {
    super(props);
    this.state =({
      index: this.props.data
    })
  }
  render() {
    return (
      <div>
        <SteppedProgressBar current={this.state.index()} num={3} labels={['first', 'second', 'third']}/>
      </div>
    )

  }
};
