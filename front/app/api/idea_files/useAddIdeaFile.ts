import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaFilesKeys from './keys';
import { IIdeaFile, AddIdeaFileObject } from './types';

const addIdeaFile = async ({ ideaId, ...requestBody }: AddIdeaFileObject) =>
  fetcher<IIdeaFile>({
    path: `/ideas/${ideaId}/files`,
    action: 'post',
    body: requestBody,
  });

const useAddIdeaFile = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdeaFile, CLErrors, AddIdeaFileObject>({
    mutationFn: addIdeaFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ideaFilesKeys.list({
          ideaId: variables.ideaId,
        }),
      });
    },
  });
};

export default useAddIdeaFile;
