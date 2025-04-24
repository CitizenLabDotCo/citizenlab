import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import optionKeys from './keys';

const deleteOption = async ({ optionId }: { optionId: string }) =>
  fetcher({
    path: `/custom_field_options/${optionId}`,
    action: 'delete',
  });

const useDeleteCustomFieldOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOption,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: optionKeys.lists(),
      });
    },
  });
};

export default useDeleteCustomFieldOption;
