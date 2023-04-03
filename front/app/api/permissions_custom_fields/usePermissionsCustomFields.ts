// web_api/v1/phases/:phase_id/permissions/:action/permissions_custom_fields
import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import {
  IPermissionsCustomFields,
  EventsKeys,
  IPCPermissionAction,
} from './types';
import { IGlobalPermissionAction } from 'services/actionPermissions';

export type PermissionCustomFieldsProps = {
  phaseId?: string | null;
  initiativeContext?: boolean | null;
  projectId?: string | null;
  action: IGlobalPermissionAction | IPCPermissionAction;
};

const fetchEvents = ({
  phaseId,
  initiativeContext,
  projectId,
  action,
}: PermissionCustomFieldsProps) => {
  return fetcher<IPermissionsCustomFields>({
    path: initiativeContext
      ? `/permissions/${action}/permissions_custom_fields`
      : phaseId
      ? `/phases/${phaseId}/permissions/${action}/permissions_custom_fields`
      : `/projects/${projectId}/permissions/${action}/permissions_custom_fields`,
    action: 'get',
  });
};

const usePermissionsCustomFields = ({
  phaseId,
  initiativeContext,
  projectId,
  action,
}: PermissionCustomFieldsProps) => {
  return useQuery<
    IPermissionsCustomFields,
    CLErrors,
    IPermissionsCustomFields,
    EventsKeys
  >({
    queryKey: eventsKeys.list({
      phaseId,
      initiativeContext,
      projectId,
      action,
    }),
    queryFn: () =>
      fetchEvents({ phaseId, initiativeContext, projectId, action }),
  });
};

export default usePermissionsCustomFields;
