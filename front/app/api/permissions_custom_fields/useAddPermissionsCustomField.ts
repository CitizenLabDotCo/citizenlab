import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import permissionsCustomFieldsKeys from './keys';
import { IPermissionsCustomField, IPermissionsCustomFieldAdd } from './types';

const addPermissionsCustomField = async (
  requestBody: IPermissionsCustomFieldAdd
) =>
  fetcher<IPermissionsCustomField>({
    path: requestBody.initiativeId
      ? `/initiatives/${requestBody.initiativeId}/permissions/${requestBody.action}/permissions_custom_fields`
      : requestBody.phaseId
      ? `/phases/${requestBody.phaseId}/permissions/${requestBody.action}/permissions_custom_fields`
      : `/projects/${requestBody.projectId}/permissions/${requestBody.action}/permissions_custom_fields`,
    action: 'post',
    body: {
      custom_field_id: requestBody.initiativeId,
      required: requestBody.required,
    },
  });

const useAddInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IPermissionsCustomField,
    CLErrors,
    IPermissionsCustomFieldAdd
  >({
    mutationFn: addPermissionsCustomField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionsCustomFieldsKeys.all(),
      });
    },
  });
};

export default useAddInitiative;
