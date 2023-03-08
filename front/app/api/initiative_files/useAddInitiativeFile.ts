import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeFilesKeys from './keys';
import { IInitiativeFile, AddInitiativeFileObject } from './types';

const addInitiativeFile = async ({
  initiativeId,
  ...requestBody
}: AddInitiativeFileObject) =>
  fetcher<IInitiativeFile>({
    path: `/initiatives/${initiativeId}/files`,
    action: 'post',
    body: requestBody,
  });

const useAddInitiativeFile = () => {
  const queryClient = useQueryClient();
  return useMutation<IInitiativeFile, CLErrors, AddInitiativeFileObject>({
    mutationFn: addInitiativeFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: initiativeFilesKeys.list(variables.initiativeId),
      });
    },
  });
};

export default useAddInitiativeFile;
