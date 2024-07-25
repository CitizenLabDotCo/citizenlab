// web_api/v1/phases/:phase_id/permissions/:action/permissions_fields
import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import eventsKeys from './keys';
import { IPermissionsFields, EventsKeys, IListParameters } from './types';
import { getPath } from './utils';

const fetchPermissionsFields = (params: IListParameters) => {
  return fetcher<IPermissionsFields>({
    path: getPath(params),
    action: 'get',
  });
};

const usePermissionsFields = ({ phaseId, action }: IListParameters) => {
  return useQuery<IPermissionsFields, CLErrors, IPermissionsFields, EventsKeys>(
    {
      queryKey: eventsKeys.list({
        phaseId,
        action,
      }),
      queryFn: () => fetchPermissionsFields({ phaseId, action }),
    }
  );
};

export default usePermissionsFields;
