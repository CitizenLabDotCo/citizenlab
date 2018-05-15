// Libraries
import React from 'react';
import { Subscription } from 'rxjs';
import { usersCount } from 'services/stats';

// Typings
export interface Props {}
export interface State {
  count: number | null;
}

export class AllUsersCount extends React.PureComponent<Props, State> {
  sub: Subscription;

  constructor(props) {
    super(props);
    this.state = {
      count: null,
    };
  }

  componentDidMount() {
    this.sub = usersCount().observable.subscribe((response) => {
      if (response && response.count) {
        this.setState({ count: response.count });
      }
    });
  }

  componentWillUnmount() {
    this.sub.unsubscribe();
  }

  render() {
    if (!this.state.count) return null;

    return (
      <span>{this.state.count}</span>
    );
  }
}

export default AllUsersCount;
