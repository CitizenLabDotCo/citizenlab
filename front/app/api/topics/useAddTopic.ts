import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import topicsKeys from './keys';
import { ITopic, ITopicAdd } from './types';

const addTopic = async (requestBody: ITopicAdd) =>
  fetcher<ITopic>({
    path: '/topics',
    action: 'post',
    body: { topic: requestBody },
  });

const useAddTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<ITopic, CLErrors, ITopicAdd>({
    mutationFn: addTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
    },
  });
};

export default useAddTopic;
