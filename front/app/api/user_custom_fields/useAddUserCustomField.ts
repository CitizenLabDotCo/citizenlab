import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';

import userCustomFieldsForPermissionKeys from 'api/user_custom_fields_for_permission/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import userCustomFieldsKeys from './keys';
import { IUserCustomField, IUserCustomFieldInputType } from './types';

type AddCustomField = {
  enabled: boolean;
  input_type?: IUserCustomFieldInputType;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  required?: boolean;
};

const addField = async (requestBody: AddCustomField) =>
  fetcher<IUserCustomField>({
    path: `/users/custom_fields`,
    action: 'post',
    body: { custom_field: requestBody },
  });

const useAddUserCustomField = () => {
  const queryClient = useQueryClient();
  return useMutation<IUserCustomField, { errors: CLErrors }, AddCustomField>({
    mutationFn: addField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsForPermissionKeys.all(),
      });
    },
  });
};

export default useAddUserCustomField;
