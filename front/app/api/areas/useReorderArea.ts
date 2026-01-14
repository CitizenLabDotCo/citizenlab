import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import areaKeys from './keys';
import { IArea } from './types';

type IReorderParams = {
  id: string;
  ordering: number;
};

const reorderArea = ({ id, ordering }: IReorderParams) =>
  fetcher<IArea>({
    path: `/areas/${id}/reorder`,
    action: 'patch',
    body: { area: { ordering } },
  });

const useReorderArea = () => {
  const queryClient = useQueryClient();
  return useMutation<IArea, CLErrors, IReorderParams>({
    mutationFn: reorderArea,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: areaKeys.lists(),
      });
    },
  });
};

export default useReorderArea;
