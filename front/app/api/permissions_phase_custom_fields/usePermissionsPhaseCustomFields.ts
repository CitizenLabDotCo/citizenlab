// web_api/v1/phases/:phase_id/permissions/:action/permissions_custom_fields
import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsPhaseCustomFieldsKeys from './keys';
import {
  IPermissionsPhaseCustomFields,
  PermissionsPhaseCustomFieldsKeys,
  IListParameters,
} from './types';
import { getPath } from './utils';

const fetchPermissionsPhaseCustomFields = ({
  phaseId,
  action,
}: IListParameters) => {
  return fetcher<IPermissionsPhaseCustomFields>({
    path: getPath({ phaseId, action }),
    action: 'get',
  });
};

const usePermissionsPhaseCustomFields = ({
  phaseId,
  action,
}: IListParameters) => {
  return useQuery<
    IPermissionsPhaseCustomFields,
    CLErrors,
    IPermissionsPhaseCustomFields,
    PermissionsPhaseCustomFieldsKeys
  >({
    queryKey: permissionsPhaseCustomFieldsKeys.list({
      phaseId,
      action,
    }),
    queryFn: () => fetchPermissionsPhaseCustomFields({ phaseId, action }),
  });
};

export default usePermissionsPhaseCustomFields;
