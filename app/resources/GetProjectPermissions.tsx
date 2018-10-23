import { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { IPermissionData, projectPermissions } from 'services/participationContextPermissions';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  projectId: string;
}

type children = (renderProps: GetProjectPermissionsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  permissions: IPermissionData[] | undefined | null | Error;
}

export type GetProjectPermissionsChildProps = IPermissionData[] | undefined | null | Error;

export default class GetProjectPermissions extends PureComponent<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      permissions: undefined
    };
  }

  componentDidMount() {
    const { projectId } = this.props;
    this.subscriptions = [
      projectPermissions(projectId).observable.subscribe(permissions => this.setState({ permissions: !isNilOrError(permissions) ? permissions.data : permissions }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { permissions } = this.state;
    return (children as children)(permissions);
  }
}
