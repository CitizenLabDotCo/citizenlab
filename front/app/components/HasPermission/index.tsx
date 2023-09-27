import React, { PureComponent, SFC } from 'react';
import { Subscription } from 'rxjs';
import { IUser } from 'api/users/types';
import { TPermissionItem, hasPermission } from 'utils/permissions';

type Props = {
  item: TPermissionItem | null;
  action: string;
  user?: IUser;
  context?: any;
  children: any;
};

type State = {
  granted: boolean | null;
};

export default class HasPermission extends PureComponent<Props, State> {
  subscription: Subscription;
  static No: SFC<any> = (props) => <>{props.children}</>;

  constructor(props: Props) {
    super(props);
    this.state = {
      granted: null,
    };
  }

  componentDidMount() {
    this.requestPermission();
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps !== this.props) {
      this.requestPermission();
    }
  }

  requestPermission = () => {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = hasPermission(this.props).subscribe((granted) => {
      this.setState({ granted });
    });
  };

  render() {
    const children = this.props.children;
    const granted = this.state.granted;
    if (granted === null) {
      return null;
    } else if (granted) {
      return (
        <>
          {React.Children.map(children, (c: any) =>
            c.type === HasPermission.No ? null : c
          )}
        </>
      );
    } else {
      return (
        <>
          {React.Children.map(children, (c: any) =>
            c.type === HasPermission.No ? c : null
          )}
        </>
      );
    }
  }
}
