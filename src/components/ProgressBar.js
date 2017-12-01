import React, { Component } from 'react';
import SteppedProgressBar from 'patchkit-stepped-progress-bar';

export default class ProgressBarView extends Component {
  constructor(props) {
    super(props);
    this.state =({
      getIndex: this.props.data
    });
  }
  render() {
    return (
      <div>
        <SteppedProgressBar current={this.state.getIndex()} num={3} labels={['draw outer polygon', 'draw inner polygons', 'export polygon images']}/>
      </div>
    )

  }
};
