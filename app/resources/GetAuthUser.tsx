import React from 'react';
import { Subscription } from 'rxjs';
import { authUserStream } from 'services/auth';
import { IUserData } from 'services/users';

interface InputProps {}

type children = (renderProps: GetAuthUserChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  authUser: IUserData | null;
}

export type GetAuthUserChildProps = IUserData | null;

export default class GetAuthUser extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: InputProps) {
    super(props as any);
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
    return (children as children)(authUser);
  }
}
