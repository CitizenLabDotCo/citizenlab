import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import similarIdeasKeys from './keys';
import { SimilarIdeas, IQueryParameters, SimilarIdeasKeys } from './types';

export const defaultPageSize = 5;

const fetchSimilarIdeas = ({ ideaId, pageSize }: IQueryParameters) =>
  fetcher<SimilarIdeas>({
    path: `/ideas/${ideaId}/similar`,
    action: 'get',
    queryParams: {
      'page[size]': pageSize || defaultPageSize,
    },
  });

const useSimilarIdeas = (queryParams: IQueryParameters) => {
  return useQuery<SimilarIdeas, CLErrors, SimilarIdeas, SimilarIdeasKeys>({
    queryKey: similarIdeasKeys.list(queryParams),
    queryFn: () => fetchSimilarIdeas(queryParams),
  });
};

export default useSimilarIdeas;
