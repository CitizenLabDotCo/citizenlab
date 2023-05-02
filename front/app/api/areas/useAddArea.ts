import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import areaKeys from './keys';
import { IArea, IAreaAdd } from './types';

const addArea = async (requestBody: IAreaAdd) =>
  fetcher<IArea>({
    path: '/areas',
    action: 'post',
    body: { area: requestBody },
  });

const useAddArea = () => {
  const queryClient = useQueryClient();
  return useMutation<IArea, CLErrors, IAreaAdd>({
    mutationFn: addArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.lists() });
    },
  });
};

export default useAddArea;
