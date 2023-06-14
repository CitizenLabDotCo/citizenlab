import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectAllowedInputTopicsId from './keys';
import { IProjectAllowedInputTopics } from './types';

type IReorderProjectAllowedTopics = {
  id: string;
  ordering: number;
};

const reorderProjectAllowedInputTopics = ({
  id,
  ordering,
}: IReorderProjectAllowedTopics) =>
  fetcher<IProjectAllowedInputTopics>({
    path: `/projects_allowed_input_topics/${id}/reorder`,
    action: 'patch',
    body: { projects_allowed_input_topic: { ordering } },
  });

const useReorderProjectAllowedInputTopics = ({
  projectId,
}: {
  projectId: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation<
    IProjectAllowedInputTopics,
    CLErrors,
    IReorderProjectAllowedTopics
  >({
    mutationFn: reorderProjectAllowedInputTopics,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectAllowedInputTopicsId.list({ projectId }),
      });
    },
  });
};

export default useReorderProjectAllowedInputTopics;
