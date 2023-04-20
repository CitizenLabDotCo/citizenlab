import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaFilesKeys from './keys';

const deleteIdeaFile = ({
  ideaId,
  fileId,
}: {
  ideaId: string;
  fileId: string;
}) =>
  fetcher({
    path: `/ideas/${ideaId}/files/${fileId}`,
    action: 'delete',
  });

const useDeleteIdeaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIdeaFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ideaFilesKeys.list({
          ideaId: variables.ideaId,
        }),
      });
    },
  });
};

export default useDeleteIdeaFile;
