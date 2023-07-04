import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import areaKeys from './keys';
import { IArea, IAreaUpdate } from './types';

const updateArea = ({ id, ...requestBody }: IAreaUpdate) =>
  fetcher<IArea>({
    path: `/areas/${id}`,
    action: 'patch',
    body: { area: requestBody },
  });

const useUpdateArea = () => {
  const queryClient = useQueryClient();
  return useMutation<IArea, CLErrors, IAreaUpdate>({
    mutationFn: updateArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.lists() });
    },
  });
};

export default useUpdateArea;
