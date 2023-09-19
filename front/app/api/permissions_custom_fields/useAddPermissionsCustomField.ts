import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import permissionsCustomFieldsKeys from './keys';
import {
  IListParameters,
  IPermissionsCustomField,
  IPermissionsCustomFieldAdd,
} from './types';

const addPermissionsCustomField = async (
  parameters: IPermissionsCustomFieldAdd
) =>
  fetcher<IPermissionsCustomField>({
    path: parameters.initiativeContext
      ? `/permissions/${parameters.action}/permissions_custom_fields`
      : parameters.phaseId
      ? `/phases/${parameters.phaseId}/permissions/${parameters.action}/permissions_custom_fields`
      : `/projects/${parameters.projectId}/permissions/${parameters.action}/permissions_custom_fields`,
    action: 'post',
    body: {
      custom_field_id: parameters.custom_field_id,
      required: parameters.required,
    },
  });

const useAddPermissionCustomField = ({
  phaseId,
  projectId,
  initiativeContext,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();
  return useMutation<
    IPermissionsCustomField,
    CLErrors,
    IPermissionsCustomFieldAdd
  >({
    mutationFn: addPermissionsCustomField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionsCustomFieldsKeys.list({
          phaseId,
          projectId,
          initiativeContext,
          action,
        }),
      });
    },
  });
};

export default useAddPermissionCustomField;
