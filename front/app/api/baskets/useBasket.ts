import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import basketsKeys from './keys';
import { IBasket, BasketsKeys } from './types';

export const fetchBasket = ({ id }: { id?: string }) =>
  fetcher<IBasket>({ path: `/baskets/${id}`, action: 'get' });

const useBasket = (id?: string) => {
  return useQuery<IBasket, CLErrors, IBasket, BasketsKeys>({
    queryKey: basketsKeys.item({ id }),
    queryFn: () => fetchBasket({ id }),
    enabled: !!id,
    keepPreviousData: false,
  });
};

export default useBasket;
