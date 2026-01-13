import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputTopicsKeys from './keys';
import { IInputTopic } from './types';

type IReorderInputTopic = {
  projectId: string;
  id: string;
  ordering: number;
};

const reorderInputTopic = ({ id, ordering }: IReorderInputTopic) =>
  fetcher<IInputTopic>({
    path: `/input_topics/${id}/reorder`,
    action: 'patch',
    body: { input_topic: { ordering } },
  });

const useReorderInputTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IInputTopic, CLErrors, IReorderInputTopic>({
    mutationFn: reorderInputTopic,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: inputTopicsKeys.list({ projectId: variables.projectId }),
      });
    },
  });
};

export default useReorderInputTopic;
