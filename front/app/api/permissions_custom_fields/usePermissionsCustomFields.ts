// web_api/v1/phases/:phase_id/permissions/:action/permissions_custom_fields
import { useQuery } from '@tanstack/react-query';
import { CLErrors, IPCAction } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IPermissionsCustomFields, EventsKeys } from './types';

export type PermissionCustomFieldsProps = {
  phaseId?: string;
  initiativeId?: string;
  projectId: string;
  action: IPCAction;
};

const fetchEvents = ({
  phaseId,
  initiativeId,
  projectId,
  action,
}: PermissionCustomFieldsProps) => {
  return fetcher<IPermissionsCustomFields>({
    path: initiativeId
      ? `/initiatives/${initiativeId}/permissions/${action}/permissions_custom_fields`
      : phaseId
      ? `/phases/${phaseId}/permissions/${action}/permissions_custom_fields`
      : `/projects/${projectId}/permissions/${action}/permissions_custom_fields`,
    action: 'get',
  });
};

const usePermissionsCustomFields = ({
  phaseId,
  initiativeId,
  projectId,
  action,
}: PermissionCustomFieldsProps) => {
  return useQuery<
    IPermissionsCustomFields,
    CLErrors,
    IPermissionsCustomFields,
    EventsKeys
  >({
    queryKey: eventsKeys.list({ phaseId, initiativeId, projectId, action }),
    queryFn: () => fetchEvents({ phaseId, initiativeId, projectId, action }),
  });
};

export default usePermissionsCustomFields;
