import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsCustomFieldsKeys from './keys';
import { IListParameters, IPermissionsCustomField } from './types';

type ReorderPermissionsCustomField = {
  id: string;

  // These two should be defined if the
  // field is not persisted yet.
  permission_id?: string;
  custom_field_id?: string;

  // the actual parameter
  ordering: number;
};

const reorderPermissionsCustomField = ({
  id,
  ...body
}: ReorderPermissionsCustomField) =>
  fetcher<IPermissionsCustomField>({
    path: `/permissions_custom_fields/${id}/reorder`,
    action: 'patch',
    body,
  });

const useReorderPermissionsCustomField = ({
  phaseId,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();

  return useMutation<
    IPermissionsCustomField,
    CLErrors,
    ReorderPermissionsCustomField
  >({
    mutationFn: reorderPermissionsCustomField,
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

export default useReorderPermissionsCustomField;
