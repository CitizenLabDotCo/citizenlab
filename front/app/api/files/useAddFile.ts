import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import filesKeys from './keys';
import { IAddFileProperties, IFile } from './types';

const addFile = async (requestBody: IAddFileProperties) => {
  return fetcher<IFile>({
    path: `/files`,
    action: 'post',
    body: {
      file: { ...requestBody },
    },
  });
};

const useAddFile = () => {
  const queryClient = useQueryClient();
  return useMutation<IFile, CLErrors, IAddFileProperties>({
    mutationFn: addFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesKeys.lists() });
    },
  });
};

export default useAddFile;
