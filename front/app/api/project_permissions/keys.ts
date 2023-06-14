import { QueryKeys } from 'utils/cl-react-query/types';
import { ProjectPermissionsProps } from './useProjectPermissions';

const baseKey = { type: 'permission', variant: 'project' };

const projectPermissionKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: ProjectPermissionsProps) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
} satisfies QueryKeys;

export default projectPermissionKeys;
