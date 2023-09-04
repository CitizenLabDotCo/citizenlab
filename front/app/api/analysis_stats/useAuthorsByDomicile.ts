import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  IAuthorsByDomicile,
  AuthorsByDomicileKeys,
  AuthorsByDomicileQueryParams,
} from './types';
import { authorsByDomicileKeys } from './keys';

const fetchUsersByDomicile = (
  analysisId: string,
  queryParams: AuthorsByDomicileQueryParams
) =>
  fetcher<IAuthorsByDomicile>({
    path: `/analyses/${analysisId}/stats/authors_by_domicile`,
    action: 'get',
    queryParams,
  });

const useAuthorsByDomicile = ({
  analysisId,
  queryParams,
}: {
  analysisId: string;
  queryParams: AuthorsByDomicileQueryParams;
}) => {
  return useQuery<
    IAuthorsByDomicile,
    CLErrors,
    IAuthorsByDomicile,
    AuthorsByDomicileKeys
  >({
    queryKey: authorsByDomicileKeys.item({ analysisId, params: queryParams }),
    queryFn: () => fetchUsersByDomicile(analysisId, queryParams),
  });
};

export default useAuthorsByDomicile;
