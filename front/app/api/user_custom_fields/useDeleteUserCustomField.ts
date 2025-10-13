import { useMutation, useQueryClient } from '@tanstack/react-query';

import customFieldsWithPermissionsKeys from 'api/custom_fields_with_permissions/keys';

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
        queryKey: customFieldsWithPermissionsKeys.all(),
      });
    },
  });
};

export default useDeleteUserCustomField;
