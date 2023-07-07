import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { BasketsIdeasKeys, IBasketsIdeasData } from './types';
import basketsIdeasKeys from './keys';

export const fetchBasketsIdeas = ({ basketId }: { basketId?: string }) =>
  fetcher<IBasketsIdeasData>({
    path: `/baskets/${basketId}/baskets_ideas`,
    action: 'get',
  });

const useBasketsIdeas = (basketId?: string) => {
  return useQuery<
    IBasketsIdeasData,
    CLErrors,
    IBasketsIdeasData,
    BasketsIdeasKeys
  >({
    queryKey: basketsIdeasKeys.list({ basketId }),
    queryFn: () => fetchBasketsIdeas({ basketId }),
    enabled: !!basketId,
    keepPreviousData: false,
  });
};

export default useBasketsIdeas;
