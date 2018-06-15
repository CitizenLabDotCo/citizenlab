import React, { PureComponent } from 'react';

type Props = {};

type State = {};

export default class ClusteringDashboard extends PureComponent<Props, State> {
  render() {
    return (
      <>
        {this.props.children}
      </>
    );
  }
}
