import React from 'react';

export interface Props {}

interface State {}

export default class PagesDashboard extends React.PureComponent<Props, State> {
  render() {
    return <>{this.props.children}</>;
  }
}
