import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import permissionsCustomFieldsKeys from './keys';
import { IListParameters } from './types';

const deletePermissionsCustomField = (id: string) =>
  fetcher({
    path: `/permissions_custom_fields/${id}`,
    action: 'delete',
  });

const useDeletePermissionsCustomField = ({
  phaseId,
  projectId,
  initiativeContext,
  action,
}: IListParameters) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermissionsCustomField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionsCustomFieldsKeys.list({
          phaseId,
          projectId,
          initiativeContext,
          action,
        }),
      });
    },
  });
};

export default useDeletePermissionsCustomField;
