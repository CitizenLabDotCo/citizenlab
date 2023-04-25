// Libraries
import React from 'react';
import { Subscription } from 'rxjs';
import { usersCount } from 'services/stats';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (renderProps: GetUserCountChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  count: number | null;
  administrators_count: number | null;
  moderators_count: number | null;
}

export type GetUserCountChildProps = State;

export default class GetUserCount extends React.PureComponent<Props, State> {
  private subscription: Subscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      count: null,
      administrators_count: null,
      moderators_count: null,
    };
  }

  componentDidMount() {
    this.subscription = usersCount().observable.subscribe((response) => {
      if (!isNilOrError(response)) {
        this.setState({
          count: response.count,
          administrators_count: response.administrators_count,
          moderators_count: response.moderators_count,
        });
      }
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { children } = this.props;
    const { count, administrators_count, moderators_count } = this.state;
    return (children as children)({
      count,
      administrators_count,
      moderators_count,
    });
  }
}
