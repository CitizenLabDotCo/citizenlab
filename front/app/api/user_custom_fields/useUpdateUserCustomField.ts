import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Multiloc } from 'typings';

import userCustomFieldsForPermissionKeys from 'api/user_custom_fields_for_permission/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import userCustomFieldsKeys from './keys';
import { IUserCustomFieldInputType, IUserCustomField } from './types';

export type UpdateField = {
  customFieldId: string;
  enabled: boolean;
  input_type?: IUserCustomFieldInputType;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  required?: boolean;
};
const updateField = async ({
  customFieldId,
  ...otherFieldProperties
}: UpdateField) =>
  fetcher<IUserCustomField>({
    path: `/users/custom_fields/${customFieldId}`,
    action: 'patch',
    body: { custom_field: otherFieldProperties },
  });

const useUpdateUserCustomField = () => {
  const queryClient = useQueryClient();
  return useMutation<IUserCustomField, { errors: CLErrors }, UpdateField>({
    mutationFn: updateField,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsForPermissionKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsKeys.item({
          customFieldId: variables.customFieldId,
        }),
      });
    },
  });
};

export default useUpdateUserCustomField;
