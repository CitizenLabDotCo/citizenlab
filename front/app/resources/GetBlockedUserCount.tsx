// Libraries
import React from 'react';
import { Subscription } from 'rxjs';
import { blockedUsersCount } from 'services/users';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (
  renderProps: GetBlockedUserCountChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  count: number | undefined | null | Error;
}

export type GetBlockedUserCountChildProps = number | undefined | null | Error;

export default class GetBlockedUserCount extends React.PureComponent<
  Props,
  State
> {
  private subscription: Subscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      count: null,
    };
  }

  componentDidMount() {
    this.subscription = blockedUsersCount().observable.subscribe((response) => {
      this.setState({
        count: !isNilOrError(response)
          ? response.data.blocked_users_count
          : response,
      });
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { children } = this.props;
    const { count } = this.state;
    return (children as children)(count);
  }
}
