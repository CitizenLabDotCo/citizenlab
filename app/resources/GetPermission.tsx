import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { TPermissionItem, hasPermission } from 'services/permissions';

interface InputProps {
  item: TPermissionItem | null;
  action: string;
  context?: any;
}

type children = (renderProps: GetPermissionChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  permission: Boolean | null;
}

export type GetPermissionChildProps = Boolean | null;

export default class GetPermission extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      permission: null
    };
  }

  componentDidMount() {
    const { item, action, context } = this.props;

    this.inputProps$ = new BehaviorSubject({ item, action, context });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ item, action, context }) => hasPermission({ item, action, context }))
        .subscribe((permission) => this.setState({ permission }))
    ];
  }

  componentDidUpdate() {
    const { item, action, context } = this.props;
    this.inputProps$.next({ item, action, context });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { permission } = this.state;
    return (children as children)(permission);
  }
}
