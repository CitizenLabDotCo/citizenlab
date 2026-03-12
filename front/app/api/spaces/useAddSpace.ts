import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import spacesKeys from './keys';
import { RequestBody, Space } from './types';

export const addSpace = async (requestBody: RequestBody) => {
  return fetcher<Space>({
    path: `/spaces`,
    action: 'post',
    body: { space: requestBody },
  });
};

const useAddSpace = () => {
  const queryClient = useQueryClient();

  return useMutation<Space, CLErrors, RequestBody>({
    mutationFn: addSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesKeys.lists() });
    },
  });
};

export default useAddSpace;
