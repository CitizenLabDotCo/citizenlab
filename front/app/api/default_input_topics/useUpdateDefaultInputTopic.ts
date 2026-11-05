import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import defaultInputTopicsKeys from './keys';
import { IDefaultInputTopic, IDefaultInputTopicUpdate } from './types';

const updateDefaultInputTopic = async ({
  id,
  ...requestBody
}: IDefaultInputTopicUpdate) =>
  fetcher<IDefaultInputTopic>({
    path: `/default_input_topics/${id}`,
    action: 'patch',
    body: { default_input_topic: requestBody },
  });

const useUpdateDefaultInputTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IDefaultInputTopic, CLErrors, IDefaultInputTopicUpdate>({
    mutationFn: updateDefaultInputTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: defaultInputTopicsKeys.lists(),
      });
    },
  });
};

export default useUpdateDefaultInputTopic;
