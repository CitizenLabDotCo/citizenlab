import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsFieldsKeys from './keys';
import {
  IListParameters,
  IPermissionsField,
  IPermissionsFieldAdd,
} from './types';
import { getPath } from './utils';

const addPermissionsField = async (params: IPermissionsFieldAdd) =>
  fetcher<IPermissionsField>({
    path: getPath(params),
    action: 'post',
    body: {
      custom_field_id: params.custom_field_id,
      required: params.required,
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
