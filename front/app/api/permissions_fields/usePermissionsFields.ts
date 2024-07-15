// web_api/v1/phases/:phase_id/permissions/:action/permissions_fields
import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { isInitiativeAction } from 'api/initiative_action_descriptors/utils';

import fetcher from 'utils/cl-react-query/fetcher';

import eventsKeys from './keys';
import { IPermissionsFields, EventsKeys, IListParameters } from './types';

const fetchPermissionsFields = ({
  phaseId,
  projectId,
  action,
}: IListParameters) => {
  return fetcher<IPermissionsFields>({
    path: isInitiativeAction(action)
      ? `/permissions/${action}/permissions_fields`
      : phaseId
      ? `/phases/${phaseId}/permissions/${action}/permissions_fields`
      : `/projects/${projectId}/permissions/${action}/permissions_fields`,
    action: 'get',
  });
};

const usePermissionsFields = ({
  phaseId,
  projectId,
  action,
}: IListParameters) => {
  return useQuery<IPermissionsFields, CLErrors, IPermissionsFields, EventsKeys>(
    {
      queryKey: eventsKeys.list({
        phaseId,
        projectId,
        action,
      }),
      queryFn: () => fetchPermissionsFields({ phaseId, projectId, action }),
    }
  );
};

export default usePermissionsFields;
