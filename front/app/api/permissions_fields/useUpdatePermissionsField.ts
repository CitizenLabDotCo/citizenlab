/* PATCH web_api/v1/permissions_fields/:id
  {
    required: boolean
  } */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsFieldsKeys from './keys';
import {
  IPermissionsField,
  IPermissionCustomFieldUpdate,
  IListParameters,
} from './types';

const updatePermissionsField = ({
  id,
  ...body
}: IPermissionCustomFieldUpdate) =>
  fetcher<IPermissionsField>({
    path: `/permissions_fields/${id}`,
    action: 'patch',
    body,
  });

const useUpdatePermissionsField = ({
  phaseId,
  projectId,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();
  return useMutation<IPermissionsField, CLErrors, IPermissionCustomFieldUpdate>(
    {
      mutationFn: updatePermissionsField,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: permissionsFieldsKeys.list({
            phaseId,
            projectId,
            action,
          }),
        });
      },
    }
  );
};

export default useUpdatePermissionsField;
