// Libraries
import React from 'react';

// Typings
export interface Props {}
export interface State {}

export class AllUsers extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <p>AllUsers</p>
    );
  }
}

export default AllUsers;
