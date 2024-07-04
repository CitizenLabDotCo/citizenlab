// web_api/v1/phases/:phase_id/permissions/:action/permissions_fields
import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import eventsKeys from './keys';
import { IPermissionsFields, EventsKeys, IListParameters } from './types';

const fetchEvents = ({
  phaseId,
  initiativeContext,
  projectId,
  action,
}: IListParameters) => {
  return fetcher<IPermissionsFields>({
    path: initiativeContext
      ? `/permissions/${action}/permissions_fields`
      : phaseId
      ? `/phases/${phaseId}/permissions/${action}/permissions_fields`
      : `/projects/${projectId}/permissions/${action}/permissions_fields`,
    action: 'get',
  });
};

const usePermissionsFields = ({
  phaseId,
  initiativeContext,
  projectId,
  action,
}: IListParameters) => {
  return useQuery<IPermissionsFields, CLErrors, IPermissionsFields, EventsKeys>(
    {
      queryKey: eventsKeys.list({
        phaseId,
        initiativeContext,
        projectId,
        action,
      }),
      queryFn: () =>
        fetchEvents({ phaseId, initiativeContext, projectId, action }),
    }
  );
};

export default usePermissionsFields;
