import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsCustomFieldsKeys from './keys';
import {
  IPermissionsCustomField,
  IPermissionCustomFieldUpdate,
  IListParameters,
} from './types';

const updatePermissionsCustomField = ({
  id,
  ...body
}: IPermissionCustomFieldUpdate) =>
  fetcher<IPermissionsCustomField>({
    path: `/permissions_custom_fields/${id}`,
    action: 'patch',
    body,
  });

const useUpdatePermissionsCustomField = ({
  phaseId,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();
  return useMutation<
    IPermissionsCustomField,
    CLErrors,
    IPermissionCustomFieldUpdate
  >({
    mutationFn: updatePermissionsCustomField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionsCustomFieldsKeys.list({
          phaseId,
          action,
        }),
      });
    },
  });
};

export default useUpdatePermissionsCustomField;
