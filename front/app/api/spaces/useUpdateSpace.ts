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
    body: { space: requestBody },
  });

const useUpdateSpace = () => {
  const queryClient = useQueryClient();
  return useMutation<Space, CLErrors, SpaceUpdate>({
    mutationFn: updateSpace,
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: spacesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: spacesKeys.item({ id: variables.data.id }),
      });
    },
  });
};

export default useUpdateSpace;
