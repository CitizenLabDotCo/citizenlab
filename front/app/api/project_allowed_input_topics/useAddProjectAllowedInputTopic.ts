import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import topicsKeys from './keys';
import {
  IProjectAllowedInputTopic,
  IProjectAllowedInputTopicAdd,
} from './types';

const addTopic = async ({
  project_id,
  topic_id,
}: IProjectAllowedInputTopicAdd) =>
  fetcher<IProjectAllowedInputTopic>({
    path: '/topics',
    action: 'post',
    body: { project_id, topic_id },
  });

const useAddTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IProjectAllowedInputTopic,
    CLErrors,
    IProjectAllowedInputTopicAdd
  >({
    mutationFn: addTopic,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: topicsKeys.list({ projectId: variables.project_id }),
      });
    },
  });
};

export default useAddTopic;
