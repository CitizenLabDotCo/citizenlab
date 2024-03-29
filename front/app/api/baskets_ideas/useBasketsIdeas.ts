import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import basketsIdeasKeys from './keys';
import { BasketsIdeasKeys, IBasketsIdeas } from './types';

export const fetchBasketsIdeas = ({ basketId }: { basketId?: string }) =>
  fetcher<IBasketsIdeas>({
    path: `/baskets/${basketId}/baskets_ideas`,
    action: 'get',
  });

const useBasketsIdeas = (basketId?: string) => {
  return useQuery<IBasketsIdeas, CLErrors, IBasketsIdeas, BasketsIdeasKeys>({
    queryKey: basketsIdeasKeys.item({ basketId }),
    queryFn: () => fetchBasketsIdeas({ basketId }),
    enabled: !!basketId,
    keepPreviousData: false,
  });
};

export default useBasketsIdeas;
