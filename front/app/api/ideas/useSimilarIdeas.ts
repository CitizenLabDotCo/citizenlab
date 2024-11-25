import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IIdeas, IdeasKeys } from './types';

const fetchSimilarIdeas = ({ id }: { id?: string }) =>
  fetcher<IIdeas>({
    path: `/ideas/${id}/similarities`,
    action: 'get',
    queryParams: { 'page[size]': 100000 }, // Can be removed?
  });

const useSimilarIdeas = (id?: string) => {
  return useQuery<IIdeas, CLErrors, IIdeas, IdeasKeys>({
    queryKey: ideasKeys.item({ id }),
    queryFn: () => fetchSimilarIdeas({ id }),
    enabled: !!id,
  });
};

export default useSimilarIdeas;
