import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  IAuthorsByDomicile,
  AuthorsByDomicileKeys,
  AuthorsByDomicileQueryParams,
} from './types';
import authorsByDomicileKeys from './keys';

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
  enabled,
  queryParams,
}: {
  analysisId: string;
  enabled?: boolean;
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
    enabled: typeof enabled == undefined ? true : enabled,
  });
};

export default useAuthorsByDomicile;
