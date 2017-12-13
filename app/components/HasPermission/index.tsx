import * as React from 'react';
import * as Rx from 'rxjs';
import { groupBy } from 'lodash';
import { IUser } from 'services/users';
import { IResourceData, hasPermission } from 'services/permissions';

type Props = {
  item: IResourceData | string;
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
  static No: React.SFC<any> = (props) => <div>{props.children}</div>;

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
    if (this.state.granted) {
      return <div>{React.Children.map(children, (c: any) => c.type === HasPermission.No ? null : c)}</div>;
    } else {
      return <div>{React.Children.map(children, (c: any) => c.type === HasPermission.No ? c : null)}</div>;
    }
  }

}
