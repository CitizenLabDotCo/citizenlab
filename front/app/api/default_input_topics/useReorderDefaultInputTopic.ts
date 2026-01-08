import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import defaultInputTopicsKeys from './keys';
import { IDefaultInputTopic } from './types';

type IReorderDefaultInputTopic = {
  id: string;
  ordering: number;
};

const reorderDefaultInputTopic = ({
  id,
  ordering,
}: IReorderDefaultInputTopic) =>
  fetcher<IDefaultInputTopic>({
    path: `/default_input_topics/${id}/reorder`,
    action: 'patch',
    body: { default_input_topic: { ordering } },
  });

const useReorderDefaultInputTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IDefaultInputTopic, CLErrors, IReorderDefaultInputTopic>({
    mutationFn: reorderDefaultInputTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: defaultInputTopicsKeys.lists(),
      });
    },
  });
};

export default useReorderDefaultInputTopic;
