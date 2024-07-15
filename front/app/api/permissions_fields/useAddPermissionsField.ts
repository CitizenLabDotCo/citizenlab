import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { isInitiativeAction } from 'api/initiative_action_descriptors/utils';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsFieldsKeys from './keys';
import {
  IListParameters,
  IPermissionsField,
  IPermissionsFieldAdd,
} from './types';

const addPermissionsField = async (parameters: IPermissionsFieldAdd) =>
  fetcher<IPermissionsField>({
    path: isInitiativeAction(parameters.action)
      ? `/permissions/${parameters.action}/permissions_fields`
      : parameters.phaseId
      ? `/phases/${parameters.phaseId}/permissions/${parameters.action}/permissions_fields`
      : `/projects/${parameters.projectId}/permissions/${parameters.action}/permissions_fields`,
    action: 'post',
    body: {
      custom_field_id: parameters.custom_field_id,
      required: parameters.required,
    },
  });

const useAddPermissionsField = ({
  phaseId,
  projectId,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();
  return useMutation<IPermissionsField, CLErrors, IPermissionsFieldAdd>({
    mutationFn: addPermissionsField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionsFieldsKeys.list({
          phaseId,
          projectId,
          action,
        }),
      });
    },
  });
};

export default useAddPermissionsField;
