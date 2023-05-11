import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectProjectGroupKeys from './keys';

const deleteGroup = (id: string) =>
  fetcher({
    path: `/groups_projects/${id}`,
    action: 'delete',
  });

const useDeleteProjectGroup = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectProjectGroupKeys.list({ projectId }),
      });
    },
  });
};

export default useDeleteProjectGroup;
