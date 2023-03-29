import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import permissionsCustomFieldsKeys from './keys';

const deletePermissionsCustomField = (id: string) =>
  fetcher({
    path: `/permissions_custom_fields/${id}`,
    action: 'delete',
  });

const useDeletePermissionsCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermissionsCustomField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionsCustomFieldsKeys.all(),
      });
    },
  });
};

export default useDeletePermissionsCustomField;
