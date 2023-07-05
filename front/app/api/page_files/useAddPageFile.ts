import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pageFilesKeys from './keys';
import { IPageFile, AddPageFileObject } from './types';

const addPagesFile = async ({ pageId, ...requestBody }: AddPageFileObject) =>
  fetcher<IPageFile>({
    path: `/static_pages/${pageId}/files`,
    action: 'post',
    body: requestBody,
  });

const useAddPagesFile = () => {
  const queryClient = useQueryClient();
  return useMutation<IPageFile, CLErrors, AddPageFileObject>({
    mutationFn: addPagesFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pageFilesKeys.list({
          pageId: variables.pageId,
        }),
      });
    },
  });
};

export default useAddPagesFile;
