import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import topicKeys from './keys';
import { ITopic, ITopicUpdate } from './types';

const updateTopic = ({ id, ...requestBody }: ITopicUpdate) =>
  fetcher<ITopic>({
    path: `/topics/${id}`,
    action: 'patch',
    body: { topic: requestBody },
  });

const useUpdateTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<ITopic, CLErrors, ITopicUpdate>({
    mutationFn: updateTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
};

export default useUpdateTopic;
