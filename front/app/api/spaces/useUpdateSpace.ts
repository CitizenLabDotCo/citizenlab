import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import spacesKeys from './keys';
import { Space, RequestBody } from './types';

type SpaceUpdate = { id: string } & RequestBody;

const updateSpace = ({ id, ...requestBody }: SpaceUpdate) =>
  fetcher<Space>({
    path: `/spaces/${id}`,
    action: 'patch',
    body: { area: requestBody },
  });

const useUpdateSpace = () => {
  const queryClient = useQueryClient();
  return useMutation<Space, CLErrors, SpaceUpdate>({
    mutationFn: updateSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesKeys.lists() });
    },
  });
};

export default useUpdateSpace;
