import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import phaseFilesKeys from './keys';

const deletePhaseFile = ({
  phaseId,
  fileId,
}: {
  phaseId: string;
  fileId: string;
}) =>
  fetcher({
    path: `/phases/${phaseId}/files/${fileId}`,
    action: 'delete',
  });

const useDeletePhaseFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePhaseFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: phaseFilesKeys.list({
          phaseId: variables.phaseId,
        }),
      });
    },
  });
};

export default useDeletePhaseFile;
