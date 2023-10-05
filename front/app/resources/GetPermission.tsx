import React from 'react';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { TPermissionItem, hasPermission } from 'utils/permissions';
import { isNilOrError } from 'utils/helperUtils';

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
  permission: boolean | undefined;
}

export type GetPermissionChildProps = boolean | undefined;

export default class GetPermission extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      permission: undefined,
    };
  }

  componentDidMount() {
    const { item, action, context } = this.props;

    this.inputProps$ = new BehaviorSubject({ item, action, context });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(({ item, action, context }) => {
            if (!isNilOrError(item)) {
              return hasPermission({ item, action, context });
            }

            return of(false);
          })
        )
        .subscribe((permission) => this.setState({ permission })),
    ];
  }

  componentDidUpdate() {
    const { item, action, context } = this.props;
    this.inputProps$.next({ item, action, context });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { permission } = this.state;
    return (children as children)(permission);
  }
}
