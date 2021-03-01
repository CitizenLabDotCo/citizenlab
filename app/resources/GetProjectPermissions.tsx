import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { isNilOrError } from 'utils/helperUtils';
import {
  IPCPermissionData,
  projectPermissions,
} from 'services/actionPermissions';

interface InputProps {
  projectId?: string | null;
}

type children = (
  renderProps: GetProjectPermissionsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  permissions: IPCPermissionData[] | undefined | null | Error;
}

export type GetProjectPermissionsChildProps =
  | IPCPermissionData[]
  | undefined
  | null
  | Error;

export default class GetProjectPermissions extends React.Component<
  Props,
  State
> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      permissions: undefined,
    };
  }

  componentDidMount() {
    const { projectId } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          filter(({ projectId }: { projectId: string }) => isString(projectId)),
          switchMap(({ projectId }) => projectPermissions(projectId).observable)
        )
        .subscribe((permissions) => {
          this.setState({
            permissions: !isNilOrError(permissions)
              ? permissions.data
              : permissions,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { projectId } = this.props;
    this.inputProps$.next({ projectId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { permissions } = this.state;
    return (children as children)(permissions);
  }
}
