import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import basketKeys from './keys';
import { IBasket, INewBasket } from './types';

type UpdateBasket = Partial<INewBasket> & { id: string };

const updateBasket = ({ id, ...requestBody }: UpdateBasket) =>
  fetcher<IBasket>({
    path: `/baskets/${id}`,
    action: 'patch',
    body: { basket: requestBody },
  });

const useUpdateBasket = () => {
  const queryClient = useQueryClient();
  return useMutation<IBasket, CLErrors, UpdateBasket>({
    mutationFn: updateBasket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: basketKeys.items() });
    },
  });
};

export default useUpdateBasket;
