import React, { PureComponent } from 'react';

export interface Props {}

interface State {}

export default class CustomFieldsDashboard extends PureComponent<Props, State> {
  render() {
    return <>{this.props.children}</>;
  }
}
