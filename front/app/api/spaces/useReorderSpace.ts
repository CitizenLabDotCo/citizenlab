import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import spacesKeys from './keys';
import { Space } from './types';

type ReorderSpace = {
  id: string;
  ordering: number;
};

const reorderSpace = ({ id, ordering }: ReorderSpace) =>
  fetcher<Space>({
    path: `/spaces/${id}/reorder`,
    action: 'patch',
    body: { space: { ordering } },
  });

const useReorderSpace = () => {
  const queryClient = useQueryClient();
  return useMutation<Space, CLErrors, ReorderSpace>({
    mutationFn: reorderSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesKeys.lists() });
    },
  });
};

export default useReorderSpace;
