import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import globalTopicsKeys from './keys';
import { IGlobalTopic, IGlobalTopicUpdate } from './types';

const updateGlobalTopic = ({ id, ...requestBody }: IGlobalTopicUpdate) =>
  fetcher<IGlobalTopic>({
    path: `/global_topics/${id}`,
    action: 'patch',
    body: { global_topic: requestBody },
  });

const useUpdateGlobalTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IGlobalTopic, CLErrors, IGlobalTopicUpdate>({
    mutationFn: updateGlobalTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: globalTopicsKeys.lists() });
    },
  });
};

export default useUpdateGlobalTopic;
