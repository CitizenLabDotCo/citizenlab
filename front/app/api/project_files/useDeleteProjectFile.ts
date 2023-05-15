import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFilesKeys from './keys';

const deleteProjectFile = ({
  projectId,
  fileId,
}: {
  projectId: string;
  fileId: string;
}) =>
  fetcher({
    path: `/projects/${projectId}/files/${fileId}`,
    action: 'delete',
  });

const useDeleteProjectFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectFilesKeys.list({
          projectId: variables.projectId,
        }),
      });
    },
  });
};

export default useDeleteProjectFile;
