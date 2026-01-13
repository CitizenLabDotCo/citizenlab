import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopic, IInputTopicUpdate } from './types';

const updateInputTopic = async ({ id, ...requestBody }: IInputTopicUpdate) =>
  fetcher<IInputTopic>({
    path: `/input_topics/${id}`,
    action: 'patch',
    body: { input_topic: requestBody },
  });

const useUpdateInputTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IInputTopic, CLErrors, IInputTopicUpdate>({
    mutationFn: updateInputTopic,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: inputTopicsKeys.list({ projectId: variables.projectId }),
      });
    },
  });
};

export default useUpdateInputTopic;
