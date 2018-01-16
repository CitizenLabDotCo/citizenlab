import * as React from 'react';
import * as Rx from 'rxjs';
import { IUser } from 'services/users';
import { TPermissionItem, hasPermission } from 'services/permissions';

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

export default class HasPermission extends React.PureComponent<Props, State> {
  subscription: Rx.Subscription;
  static No: React.SFC<any> = (props) => <React.Fragment>{props.children}</React.Fragment>;

  constructor(props) {
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

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.requestPermission();
    }
  }

  requestPermission = () => {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = hasPermission(this.props).subscribe((granted) => {
      this.setState({ granted });
    });
  }

  render() {
    const children = this.props.children;
    const granted = this.state.granted;
    if (granted === null) {
      return null;
    } else if (granted) {
      return <React.Fragment>{React.Children.map(children, (c: any) => c.type === HasPermission.No ? null : c)}</React.Fragment>;
    } else {
      return <React.Fragment>{React.Children.map(children, (c: any) => c.type === HasPermission.No ? c : null)}</React.Fragment>;
    }
  }

}
