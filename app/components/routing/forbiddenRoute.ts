import React from 'react';
import clHistory from 'utils/cl-router/history';

export default class ForbiddenRoute extends React.PureComponent {
  componentDidMount() {
    clHistory.push('/sign-in');
  }

  render() {
    return null;
  }
}
