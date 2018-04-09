import React from 'react';
import { Subscription } from 'rxjs';
import { authUserStream } from 'services/auth';
import { IUserData } from 'services/users';

interface Props {
  children: (renderProps: GetAuthUserChildProps) => JSX.Element | null ;
}

interface State {
  authUser: IUserData | null;
}

export type GetAuthUserChildProps = State;

export default class GetAuthUser extends React.PureComponent<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      authUser: null
    };
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      authUser$.subscribe((authUser) => {
        this.setState({ authUser: (authUser ? authUser.data : null) });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { authUser } = this.state;
    return children({ authUser });
  }
}
