import { useMutation, useQueryClient } from '@tanstack/react-query';
import { omit } from 'lodash-es';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import eventsKeys from './keys';
import { IFile, IUpdateFileProperties } from './types';

const updateFile = async (requestBody: IUpdateFileProperties) => {
  return fetcher<IFile>({
    path: `/files/${requestBody.id}`,
    action: 'patch',
    body: { ...omit(requestBody, 'id') },
  });
};

const useUpdateFile = () => {
  const queryClient = useQueryClient();
  return useMutation<IFile, CLErrors, IUpdateFileProperties>({
    mutationFn: updateFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
    },
  });
};

// ts-prune-ignore-next
export default useUpdateFile;
