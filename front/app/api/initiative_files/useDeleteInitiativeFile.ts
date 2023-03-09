import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeFilesKeys from './keys';

const deleteInitiativeFile = ({
  initiativeId,
  fileId,
}: {
  initiativeId: string;
  fileId: string;
}) =>
  fetcher({
    path: `/initiatives/${initiativeId}/files/${fileId}`,
    action: 'delete',
  });

const useDeleteInitiativeFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInitiativeFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: initiativeFilesKeys.list(variables.initiativeId),
      });
    },
  });
};

export default useDeleteInitiativeFile;
