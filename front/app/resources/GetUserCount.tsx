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
  count: number | undefined | null | Error;
}

export type GetUserCountChildProps = number | undefined | null | Error;

export default class GetUserCount extends React.PureComponent<Props, State> {
  private subscription: Subscription;

  constructor(props) {
    super(props);
    this.state = {
      count: null,
    };
  }

  componentDidMount() {
    this.subscription = usersCount().observable.subscribe((response) => {
      this.setState({
        count: !isNilOrError(response) ? response.count : response,
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
