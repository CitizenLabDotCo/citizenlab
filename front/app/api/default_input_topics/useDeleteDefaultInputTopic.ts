import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import defaultInputTopicsKeys from './keys';

const deleteDefaultInputTopic = (id: string) =>
  fetcher({
    path: `/default_input_topics/${id}`,
    action: 'delete',
  });

const useDeleteDefaultInputTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDefaultInputTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: defaultInputTopicsKeys.lists(),
      });
    },
  });
};

export default useDeleteDefaultInputTopic;
