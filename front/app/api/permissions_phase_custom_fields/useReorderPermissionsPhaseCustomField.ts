import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsPhaseCustomFieldsKeys from './keys';
import { IListParameters, IPermissionsPhaseCustomField } from './types';

type ReorderPermissionsPhaseCustomField = {
  id: string;

  // These two should be defined if the
  // field is not persisted yet.
  permission_id?: string;
  custom_field_id?: string;

  // the actual parameter
  ordering: number;
};

const reorderPermissionsPhaseCustomField = ({
  id,
  ...body
}: ReorderPermissionsPhaseCustomField) =>
  fetcher<IPermissionsPhaseCustomField>({
    path: `/permissions_custom_fields/${id}/reorder`,
    action: 'patch',
    body,
  });

const useReorderPermissionsPhaseCustomField = ({
  phaseId,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();

  return useMutation<
    IPermissionsPhaseCustomField,
    CLErrors,
    ReorderPermissionsPhaseCustomField
  >({
    mutationFn: reorderPermissionsPhaseCustomField,
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

export default useReorderPermissionsPhaseCustomField;
