import { QueryKeys } from 'utils/cl-react-query/types';
import { ProjectPermissionsProps } from './useProjectPermissions';

const projectPermissionKeys = {
  all: () => [{ type: 'events' }],
  lists: () => [{ ...projectPermissionKeys.all()[0], operation: 'list' }],
  list: ({ projectId }: ProjectPermissionsProps) => [
    { ...projectPermissionKeys.lists()[0], projectId },
  ],
} satisfies QueryKeys;

export default projectPermissionKeys;
