import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import phaseFilesKeys from './keys';
import { IPhaseFile, AddPhaseFileObject } from './types';

const addPhaseFile = async ({ phaseId, ...requestBody }: AddPhaseFileObject) =>
  fetcher<IPhaseFile>({
    path: `/phases/${phaseId}/files`,
    action: 'post',
    body: {
      file: {
        name: requestBody.name,
        ordering: requestBody.ordering,
        file: requestBody.base64,
      },
    },
  });

const useAddPhaseFile = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IPhaseFile,
    CLErrors,
    AddPhaseFileObject & { invalidate?: boolean }
  >({
    mutationFn: ({ invalidate: _invalidate, ...vars }) => addPhaseFile(vars),
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

export default useAddPhaseFile;
