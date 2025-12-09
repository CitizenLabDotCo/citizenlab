import { useMutation, useQueryClient } from '@tanstack/react-query';

import userCustomFieldsForPermissionKeys from 'api/user_custom_fields_for_permission/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import optionKeys from './keys';

const deleteField = async (customFieldId: string) =>
  fetcher({
    path: `/users/custom_fields/${customFieldId}`,
    action: 'delete',
  });

const useDeleteUserCustomField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: optionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: userCustomFieldsForPermissionKeys.all(),
      });
    },
  });
};

export default useDeleteUserCustomField;
