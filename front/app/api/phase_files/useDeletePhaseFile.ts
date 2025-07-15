import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher, { BaseResponseData } from 'utils/cl-react-query/fetcher';

import phaseFilesKeys from './keys';

type DeletePhaseFileArgs = {
  phaseId: string;
  fileId: string;
  invalidate?: boolean;
};

const deletePhaseFile = ({ phaseId, fileId }: DeletePhaseFileArgs) =>
  fetcher({
    path: `/phases/${phaseId}/files/${fileId}`,
    action: 'delete',
  });

const useDeletePhaseFile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Omit<BaseResponseData, 'included'>,
    CLErrors,
    DeletePhaseFileArgs
  >({
    mutationFn: ({ invalidate: _invalidate, ...vars }) => deletePhaseFile(vars),
    onSuccess: (_data, { invalidate = true, ...variables }) => {
      if (invalidate) {
        queryClient.invalidateQueries({
          queryKey: phaseFilesKeys.list({
            phaseId: variables.phaseId,
          }),
        });
      }
    },
  });
};

export default useDeletePhaseFile;
