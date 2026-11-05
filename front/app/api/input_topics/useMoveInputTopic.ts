import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopic, IInputTopicMove, MovePosition } from './types';

type IMoveInputTopicParams = IInputTopicMove & {
  projectId: string;
};

const moveInputTopic = ({ id, position, target_id }: IMoveInputTopicParams) =>
  fetcher<IInputTopic>({
    path: `/input_topics/${id}/move`,
    action: 'patch',
    body: { input_topic: { position, target_id } },
  });

const useMoveInputTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IInputTopic, CLErrors, IMoveInputTopicParams>({
    mutationFn: moveInputTopic,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: inputTopicsKeys.list({ projectId: variables.projectId }),
      });
    },
  });
};

export default useMoveInputTopic;

export type { MovePosition };
