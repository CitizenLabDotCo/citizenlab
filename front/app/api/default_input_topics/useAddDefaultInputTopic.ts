import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import defaultInputTopicsKeys from './keys';
import { IDefaultInputTopic, IDefaultInputTopicAdd } from './types';

const addDefaultInputTopic = async (requestBody: IDefaultInputTopicAdd) =>
  fetcher<IDefaultInputTopic>({
    path: '/default_input_topics',
    action: 'post',
    body: { default_input_topic: requestBody },
  });

const useAddDefaultInputTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IDefaultInputTopic, CLErrors, IDefaultInputTopicAdd>({
    mutationFn: addDefaultInputTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: defaultInputTopicsKeys.lists(),
      });
    },
  });
};

export default useAddDefaultInputTopic;
