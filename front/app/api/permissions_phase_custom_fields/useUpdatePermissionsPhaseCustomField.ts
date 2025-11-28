import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsPhaseCustomFieldsKeys from './keys';
import {
  IPermissionsPhaseCustomField,
  IPermissionPhaseCustomFieldUpdate,
  IListParameters,
} from './types';

const updatePermissionsPhaseCustomField = ({
  id,
  ...body
}: IPermissionPhaseCustomFieldUpdate) =>
  fetcher<IPermissionsPhaseCustomField>({
    path: `/permissions_custom_fields/${id}`,
    action: 'patch',
    body,
  });

const useUpdatePermissionsPhaseCustomField = ({
  phaseId,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();
  return useMutation<
    IPermissionsPhaseCustomField,
    CLErrors,
    IPermissionPhaseCustomFieldUpdate
  >({
    mutationFn: updatePermissionsPhaseCustomField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionsPhaseCustomFieldsKeys.list({
          phaseId,
          action,
        }),
      });
    },
  });
};

export default useUpdatePermissionsPhaseCustomField;
