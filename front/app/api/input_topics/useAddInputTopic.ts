import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopic, IInputTopicAdd } from './types';

const addInputTopic = async ({ projectId, ...requestBody }: IInputTopicAdd) =>
  fetcher<IInputTopic>({
    path: `/projects/${projectId}/input_topics`,
    action: 'post',
    body: { input_topic: requestBody },
  });

const useAddInputTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IInputTopic, CLErrors, IInputTopicAdd>({
    mutationFn: addInputTopic,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: inputTopicsKeys.list({ projectId: variables.projectId }),
      });
    },
  });
};

export default useAddInputTopic;
