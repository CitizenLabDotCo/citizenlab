import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsFieldsKeys from './keys';
import { IListParameters } from './types';

const deletePermissionsField = (id: string) =>
  fetcher({
    path: `/permissions_fields/${id}`,
    action: 'delete',
  });

const useDeletePermissionsField = ({ phaseId, action }: IListParameters) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermissionsField,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionsFieldsKeys.list({
          phaseId,
          action,
        }),
      });
    },
  });
};

export default useDeletePermissionsField;
