import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectAllowedInputTopicsKeys from './keys';

const deleteTopic = (id: string) =>
  fetcher({
    path: `/projects_allowed_input_topics/${id}`,
    action: 'delete',
  });

const useDeleteAllowedProjectInputTopic = ({
  projectId,
}: {
  projectId: string;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectAllowedInputTopicsKeys.list({ projectId }),
      });
    },
  });
};

export default useDeleteAllowedProjectInputTopic;
