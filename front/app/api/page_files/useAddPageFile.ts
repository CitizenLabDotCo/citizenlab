import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import pageFilesKeys from './keys';
import { IPageFile, AddPageFileObject } from './types';

const addPageFile = async ({
  pageId,
  file: { name, file, ordering = null },
}: AddPageFileObject) =>
  fetcher<IPageFile>({
    path: `/static_pages/${pageId}/files`,
    action: 'post',
    body: { file: { name, file, ordering } },
  });

const useAddPageFile = () => {
  const queryClient = useQueryClient();
  return useMutation<IPageFile, CLErrors, AddPageFileObject>({
    mutationFn: addPageFile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pageFilesKeys.lists(),
      });
    },
  });
};

export default useAddPageFile;
