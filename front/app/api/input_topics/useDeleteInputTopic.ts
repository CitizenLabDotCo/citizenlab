import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';

type DeleteInputTopicParams = {
  projectId: string;
  id: string;
};

const deleteInputTopic = ({ id }: DeleteInputTopicParams) =>
  fetcher({
    path: `/input_topics/${id}`,
    action: 'delete',
  });

const useDeleteInputTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInputTopic,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: inputTopicsKeys.list({ projectId: variables.projectId }),
      });
    },
  });
};

export default useDeleteInputTopic;
