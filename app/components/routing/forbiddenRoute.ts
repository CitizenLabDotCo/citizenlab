import React from 'react';
import { browserHistory } from 'react-router';

export default class ForbiddenRoute extends React.PureComponent {
  componentDidMount() {
    browserHistory.push('/sign-in');
  }

  render() {
    return null;
  }
}
