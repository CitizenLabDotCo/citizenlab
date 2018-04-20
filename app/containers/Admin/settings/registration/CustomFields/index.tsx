import * as React from 'react';

type Props = {};

type State = {};

export default class CustomFieldsDashboard extends React.PureComponent<Props, State> {
  render() {
    return (
      <>
        {this.props.children}
      </>
    );
  }
}
