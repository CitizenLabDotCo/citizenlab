import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsPhaseCustomFieldsKeys from './keys';
import {
  IListParameters,
  IPermissionsPhaseCustomField,
  IPermissionsPhaseCustomFieldAdd,
} from './types';
import { getPath } from './utils';

const addPermissionsPhaseCustomField = async (
  params: IPermissionsPhaseCustomFieldAdd
) =>
  fetcher<IPermissionsPhaseCustomField>({
    path: getPath(params),
    action: 'post',
    body: {
      custom_field_id: params.custom_field_id,
      required: params.required,
    },
  });

const useAddPermissionsPhaseCustomField = ({
  phaseId,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();
  return useMutation<
    IPermissionsPhaseCustomField,
    CLErrors,
    IPermissionsPhaseCustomFieldAdd
  >({
    mutationFn: addPermissionsPhaseCustomField,
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

export default useAddPermissionsPhaseCustomField;
