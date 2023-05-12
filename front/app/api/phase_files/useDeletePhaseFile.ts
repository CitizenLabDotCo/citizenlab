import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import phaseFilesKeys from './keys';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

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
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/phases/${variables.phaseId}`],
      });
    },
  });
};

export default useDeletePhaseFile;
