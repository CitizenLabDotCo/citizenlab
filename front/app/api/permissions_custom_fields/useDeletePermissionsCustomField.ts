import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsCustomFieldsKeys from './keys';
import { IListParameters } from './types';

type DeletePermissionsCustomField = {
  id: string;

  // These two should be defined if the
  // field is not persisted yet.
  permission_id?: string;
  custom_field_id?: string;
};

const deletePermissionsCustomField = ({
  id,
  ...body
}: DeletePermissionsCustomField) => {
  return fetcher({
    path: `/permissions_custom_fields/${id}`,
    action: 'delete',
    body,
  });
};

const useDeletePermissionsCustomField = ({
  phaseId,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermissionsCustomField,
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

export default useDeletePermissionsCustomField;
