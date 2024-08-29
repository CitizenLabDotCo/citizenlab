import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsCustomFieldsKeys from './keys';
import {
  IListParameters,
  IPermissionsCustomField,
  IPermissionsCustomFieldAdd,
} from './types';
import { getPath } from './utils';

const addPermissionsCustomField = async (params: IPermissionsCustomFieldAdd) =>
  fetcher<IPermissionsCustomField>({
    path: getPath(params),
    action: 'post',
    body: {
      custom_field_id: params.custom_field_id,
      required: params.required,
    },
  });

const useAddPermissionsCustomField = ({ phaseId, action }: IListParameters) => {
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
          action,
        }),
      });
    },
  });
};

export default useAddPermissionsCustomField;
