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
import { isPersistedUpdate, getPath } from './utils';

const updatePermissionsField = (params: IPermissionCustomFieldUpdate) => {
  if (isPersistedUpdate(params)) {
    const { id, ...body } = params;

    return fetcher<IPermissionsField>({
      path: `/permissions_fields/${id}`,
      action: 'patch',
      body,
    });
  } else {
    return fetcher<IPermissionsField>({
      path: getPath(params),
      action: 'patch',
      body: {
        custom_field_id: params.custom_field_id,
        required: params.required,
      },
    });
  }
};

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
