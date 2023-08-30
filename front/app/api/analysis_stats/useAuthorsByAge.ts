import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  IAuthorsByAge,
  AuthorsByAgeKeys,
  AuthorsByAgeQueryParams,
} from './types';
import { authorsByAgeKeys } from './keys';

const fetchUsersByAge = (
  analysisId: string,
  queryParams: AuthorsByAgeQueryParams
) =>
  fetcher<IAuthorsByAge>({
    path: `/analyses/${analysisId}/stats/authors_by_age`,
    action: 'get',
    queryParams,
  });

const useAuthorsByAge = ({
  analysisId,
  enabled,
  queryParams,
}: {
  analysisId: string;
  enabled?: boolean;
  queryParams: AuthorsByAgeQueryParams;
}) => {
  return useQuery<IAuthorsByAge, CLErrors, IAuthorsByAge, AuthorsByAgeKeys>({
    queryKey: authorsByAgeKeys.item({ analysisId, params: queryParams }),
    queryFn: () => fetchUsersByAge(analysisId, queryParams),
    enabled: typeof enabled == undefined ? true : enabled,
  });
};

export default useAuthorsByAge;
