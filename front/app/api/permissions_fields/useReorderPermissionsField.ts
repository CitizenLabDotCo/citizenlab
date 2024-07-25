import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsFieldsKeys from './keys';
import { IPermissionsField } from './types';

type ReorderPermissionsField = {
  id: string;

  // These two should be defined if the
  // field is not persisted yet.
  permission_id?: string;
  custom_field_id?: string;

  // the actual parameter
  ordering: number;
};

const reorderPermissionsField = ({ id, ...body }: ReorderPermissionsField) =>
  fetcher<IPermissionsField>({
    path: `/permissions_fields/${id}/reorder`,
    action: 'patch',
    body,
  });

const useReorderPermissionsField = () => {
  const queryClient = useQueryClient();
  return useMutation<IPermissionsField, CLErrors, ReorderPermissionsField>({
    mutationFn: reorderPermissionsField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionsFieldsKeys.lists(),
      });
    },
  });
};

export default useReorderPermissionsField;
