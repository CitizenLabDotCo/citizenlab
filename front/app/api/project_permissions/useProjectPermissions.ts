import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectPermissionKeys from './keys';
import { IPCPermissions, ProjectPermissionKeys } from './types';

export type ProjectPermissionsProps = {
  projectId: string | undefined;
};

const fetchEvents = ({ projectId }: ProjectPermissionsProps) => {
  return fetcher<IPCPermissions>({
    path: `/projects/${projectId}/permissions`,
    action: 'get',
  });
};

const useProjectPermissions = ({ projectId }: ProjectPermissionsProps) => {
  return useQuery<
    IPCPermissions,
    CLErrors,
    IPCPermissions,
    ProjectPermissionKeys
  >({
    queryKey: projectPermissionKeys.list({ projectId }),
    queryFn: () => fetchEvents({ projectId }),
  });
};

export default useProjectPermissions;
