import { useMutation, useQueryClient } from '@tanstack/react-query';

import permissionsCustomFieldsKeys from 'api/permissions_custom_fields/keys';

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
        queryKey: permissionsCustomFieldsKeys.all(),
      });
    },
  });
};

export default useDeleteUserCustomField;
