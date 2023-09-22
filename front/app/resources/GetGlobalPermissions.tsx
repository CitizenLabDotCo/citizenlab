import { IGlobalPermissionData } from 'api/permissions/types';
import usePermissions from 'api/permissions/usePermissions';

interface InputProps {
  projectId?: string | null;
}

type children = (
  renderProps: GetGlobalPermissionsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetGlobalPermissionsChildProps =
  | IGlobalPermissionData[]
  | undefined;

// TODO remove this later when we actually start using 'visiting' as a permission
const notVisitingPermission = (data: IGlobalPermissionData) => {
  return (data.attributes.action as any) !== 'visiting';
};

const GetGlobalPermissions = ({ children }: Props) => {
  const { data: permissions } = usePermissions();

  return (children as children)(
    permissions?.data.filter(notVisitingPermission)
  );
};

export default GetGlobalPermissions;
