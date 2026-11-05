import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import globalTopicsKeys from './keys';

const deleteGlobalTopic = (id: string) =>
  fetcher({
    path: `/global_topics/${id}`,
    action: 'delete',
  });

const useDeleteGlobalTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGlobalTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: globalTopicsKeys.lists(),
      });
    },
  });
};

export default useDeleteGlobalTopic;
