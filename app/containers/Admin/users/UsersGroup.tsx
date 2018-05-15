// Libraries
import React from 'react';

// Typings
export interface Props {}
export interface State {}

export class UsersGroup extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <p>UsersGroup</p>
    );
  }
}

export default UsersGroup;
