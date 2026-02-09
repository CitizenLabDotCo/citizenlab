import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsPhaseCustomFieldsKeys from './keys';
import { IListParameters } from './types';

type DeletePermissionsPhaseCustomField = {
  id: string;

  // These two should be defined if the
  // field is not persisted yet.
  permission_id?: string;
  custom_field_id?: string;
};

const deletePermissionsPhaseCustomField = ({
  id,
  ...body
}: DeletePermissionsPhaseCustomField) => {
  return fetcher({
    path: `/permissions_custom_fields/${id}`,
    action: 'delete',
    body,
  });
};

const useDeletePermissionsPhaseCustomField = ({
  phaseId,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermissionsPhaseCustomField,
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

export default useDeletePermissionsPhaseCustomField;
