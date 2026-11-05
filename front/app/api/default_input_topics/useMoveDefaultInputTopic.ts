import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import defaultInputTopicsKeys from './keys';
import {
  IDefaultInputTopic,
  IDefaultInputTopicMove,
  MovePosition,
} from './types';

const moveDefaultInputTopic = ({
  id,
  position,
  target_id,
}: IDefaultInputTopicMove) =>
  fetcher<IDefaultInputTopic>({
    path: `/default_input_topics/${id}/move`,
    action: 'patch',
    body: { default_input_topic: { position, target_id } },
  });

const useMoveDefaultInputTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IDefaultInputTopic, CLErrors, IDefaultInputTopicMove>({
    mutationFn: moveDefaultInputTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: defaultInputTopicsKeys.lists(),
      });
    },
  });
};

export default useMoveDefaultInputTopic;

export type { MovePosition };
