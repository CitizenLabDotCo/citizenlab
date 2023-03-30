import React from 'react';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';
import {
  globalPermissions,
  IGlobalPermissionData,
} from 'services/actionPermissions';

interface InputProps {
  projectId?: string | null;
}

type children = (
  renderProps: GetGlobalPermissionsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  permissions: IGlobalPermissionData[] | undefined | null | Error;
}

export type GetGlobalPermissionsChildProps =
  | IGlobalPermissionData[]
  | undefined
  | null
  | Error;

// TODO remove this later when we actually start using 'visiting' as a permission
const notVisitingPermission = (data: IGlobalPermissionData) => {
  return (data.attributes.action as any) !== 'visiting';
};

export default class GetGlobalPermissions extends React.Component<
  Props,
  State
> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      permissions: undefined,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      globalPermissions().observable.subscribe((permissions) => {
        this.setState({
          permissions: !isNilOrError(permissions)
            ? permissions.data.filter(notVisitingPermission)
            : permissions,
        });
      }),
    ];
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
