import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IIdeas } from './types';

const fetchSimilarIdeas = ({ id }: { id?: string }) =>
  fetcher<IIdeas>({
    path: `/ideas/${id}/similarities`,
    action: 'get',
    // queryParams: { 'page[size]': 10 }, // Only return the 10 most similar ideas
  });

const useSimilarIdeas = (id?: string) => {
  return useQuery<IIdeas, CLErrors, IIdeas>({
    queryKey: ['ideas', 'similar', id],
    queryFn: () => fetchSimilarIdeas({ id }),
    enabled: !!id,
  });
};

export default useSimilarIdeas;
