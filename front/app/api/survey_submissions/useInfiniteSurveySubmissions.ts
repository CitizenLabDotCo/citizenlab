import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import surveySubmissionsKeys from './keys';
import {
  ISurveySubmissions,
  ISurveySubmissionsQueryParameters,
  SurveySubmissionsKeys,
} from './types';

const defaultPageSize = 100;

const fetchSurveySubmissions = (
  { phaseId, pageSize }: ISurveySubmissionsQueryParameters,
  pageNumber?: number
) =>
  fetcher<ISurveySubmissions>({
    path: `/phases/${phaseId}/survey_submissions`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
    },
  });

const useInfiniteSurveySubmissions = (
  queryParams: ISurveySubmissionsQueryParameters
) => {
  return useInfiniteQuery<
    ISurveySubmissions,
    CLErrors,
    ISurveySubmissions,
    SurveySubmissionsKeys
  >({
    queryKey: surveySubmissionsKeys.list(queryParams),
    queryFn: ({ pageParam }) => fetchSurveySubmissions(queryParams, pageParam),
    getNextPageParam: (lastPage) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    enabled: !!queryParams.phaseId,
  });
};

export default useInfiniteSurveySubmissions;
