import { isString } from 'lodash-es';
import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import {
  IPCPermissionData,
  phasePermissions,
} from 'services/actionPermissions';
import { isNilOrError } from 'utils/helperUtils';
import shallowCompare from 'utils/shallowCompare';

interface InputProps {
  phaseId?: string | null;
}

type children = (
  renderProps: GetPhasePermissionsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  permissions: IPCPermissionData[] | undefined | null | Error;
}

export type GetPhasePermissionsChildProps = State['permissions'];

export default class GetPhasePermissions extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      permissions: undefined,
    };
  }

  componentDidMount() {
    const { phaseId } = this.props;

    this.inputProps$ = new BehaviorSubject({ phaseId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          filter(({ phaseId }: { phaseId: string }) => isString(phaseId)),
          switchMap(({ phaseId }) => phasePermissions(phaseId).observable)
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
    const { phaseId } = this.props;
    this.inputProps$.next({ phaseId });
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
