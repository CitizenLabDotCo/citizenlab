import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { RequestBody, Space } from './types';

export const addSpace = async (requestBody: RequestBody) => {
  return fetcher<Space>({
    path: `/spaces`,
    action: 'post',
    body: { space: requestBody },
  });
};

const useAddSpace = () => {
  return useMutation<Space, CLErrors, RequestBody>({
    mutationFn: addSpace,
  });
};

export default useAddSpace;
