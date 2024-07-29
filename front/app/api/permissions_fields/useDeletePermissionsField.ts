import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isInitiativeAction } from 'api/initiative_action_descriptors/utils';
import { Action } from 'api/permissions/types';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsFieldsKeys from './keys';

type DeletePermissionsField = {
  id: string;
  action: Action;
  phaseId?: string;

  // These two should be defined if the
  // field is not persisted yet.
  // permission_id?: string;
};

const deletePermissionsField = ({
  id,
  action,
  phaseId,
  ...body
}: DeletePermissionsField) => {
  if (isInitiativeAction(action)) {
    return fetcher({
      path: `/permissions_fields/${id}`,
      action: 'delete',
      body,
    });
  }

  return fetcher({
    path: `/phases/${phaseId}/permissions/${action}/permissions_fields/${id}`,
    action: 'delete',
    body,
  });
};

const useDeletePermissionsField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermissionsField,
    onSuccess: (_, { phaseId, action }) => {
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
