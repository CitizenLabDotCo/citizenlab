import React, { ReactElement } from 'react';
import { Subscription } from 'rxjs';
import { authUserStream } from 'services/auth';
import { IUserData } from 'services/users';

interface InputProps {}

type children = (renderProps: GetAuthUserChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  authUser: IUserData | undefined | null;
}

export type GetAuthUserChildProps = IUserData | undefined | null;

export default class GetAuthUser extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      authUser: undefined,
    };
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      authUser$.subscribe((authUser) => {
        this.setState({ authUser: authUser ? authUser.data : null });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { authUser } = this.state;
    return (children as children)(authUser);
  }
}

export function withAuthUser(Component: React.ComponentType<any | string>) {
  return (props: any): ReactElement => (
    <GetAuthUser {...props}>
      {(authUser) => <Component authUser={authUser} {...props} />}
    </GetAuthUser>
  );
}
