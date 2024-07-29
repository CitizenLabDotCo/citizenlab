import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsFieldsKeys from './keys';
import { IListParameters } from './types';

type DeletePermissionsField = {
  id: string;

  // These two should be defined if the
  // field is not persisted yet.
  permission_id?: string;
  custom_field_id?: string;
};

const deletePermissionsField = ({ id, ...body }: DeletePermissionsField) => {
  return fetcher({
    path: `/permissions_fields/${id}`,
    action: 'delete',
    body,
  });
};

const useDeletePermissionsField = ({ phaseId, action }: IListParameters) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermissionsField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionsFieldsKeys.list({
          phaseId,
          action,
        }),
      });
    },
  });
};

export default useDeletePermissionsField;
