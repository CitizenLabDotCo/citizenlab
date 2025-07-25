import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import phaseFilesKeys from './keys';
import { IPhaseFile, UpdatePhaseFileObject } from './types';

const updatePhaseFile = async ({
  phaseId,
  fileId,
  ...requestBody
}: UpdatePhaseFileObject) =>
  fetcher<IPhaseFile>({
    path: `/phases/${phaseId}/files/${fileId}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdatePhaseFile = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IPhaseFile,
    CLErrors,
    UpdatePhaseFileObject & { invalidate?: boolean }
  >({
    mutationFn: ({ invalidate: _invalidate, ...vars }) => updatePhaseFile(vars),
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

export default useUpdatePhaseFile;
