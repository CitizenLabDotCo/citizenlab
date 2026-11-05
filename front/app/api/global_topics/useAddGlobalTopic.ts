import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import globalTopicsKeys from './keys';
import { IGlobalTopic, IGlobalTopicAdd } from './types';

const addGlobalTopic = async (requestBody: IGlobalTopicAdd) =>
  fetcher<IGlobalTopic>({
    path: '/global_topics',
    action: 'post',
    body: { global_topic: requestBody },
  });

const useAddGlobalTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IGlobalTopic, CLErrors, IGlobalTopicAdd>({
    mutationFn: addGlobalTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: globalTopicsKeys.lists() });
    },
  });
};

export default useAddGlobalTopic;
