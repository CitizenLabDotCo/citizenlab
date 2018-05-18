// Libraries
import React from 'react';

// Components
import NoUsers from './NoUsers';

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
      <NoUsers/>
    );
  }
}

export default UsersGroup;
