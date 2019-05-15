// Libraries
import React from 'react';
import { Subscription } from 'rxjs';
import { ideasCountForUser, commentsCountForUser } from 'services/stats';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (renderProps: GetUserStatsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
  userId: string;
  resource: 'comments' | 'ideas';
}

interface State {
  count: number | undefined | null | Error;
}

export type GetUserStatsChildProps = number | undefined | null | Error;

export default class GetUserStats extends React.PureComponent<Props, State> {
  private subscription: Subscription;

  constructor(props) {
    super(props);
    this.state = {
      count: null,
    };
  }

  componentDidMount() {
    const { resource, userId } = this.props;
    if (resource === 'ideas') {
      this.subscription = ideasCountForUser(userId).observable.subscribe((response) => {
        this.setState({ count: !isNilOrError(response) ? response.count : response });
      });
    } else if (resource === 'comments') {
      this.subscription = commentsCountForUser(userId).observable.subscribe((response) => {
        this.setState({ count: !isNilOrError(response) ? response.count : response });
      });
    }
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
