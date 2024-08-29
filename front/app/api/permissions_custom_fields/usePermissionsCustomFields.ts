// web_api/v1/phases/:phase_id/permissions/:action/permissions_custom_fields
import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsCustomFieldsKeys from './keys';
import { IPermissionsCustomFields, EventsKeys, IListParameters } from './types';
import { getPath } from './utils';

const fetchPermissionsCustomFields = ({ phaseId, action }: IListParameters) => {
  return fetcher<IPermissionsCustomFields>({
    path: getPath({ phaseId, action }),
    action: 'get',
  });
};

const usePermissionsCustomFields = ({ phaseId, action }: IListParameters) => {
  return useQuery<
    IPermissionsCustomFields,
    CLErrors,
    IPermissionsCustomFields,
    EventsKeys
  >({
    queryKey: permissionsCustomFieldsKeys.list({
      phaseId,
      action,
    }),
    queryFn: () => fetchPermissionsCustomFields({ phaseId, action }),
  });
};

export default usePermissionsCustomFields;
