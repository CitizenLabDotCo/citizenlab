import React from 'react';

type Props = {};

type State = {};

export default class ProjectDashboard extends React.PureComponent<Props, State> {
  render() {
    return (
      <>
        {this.props.children}
      </>
    );
  }
}
