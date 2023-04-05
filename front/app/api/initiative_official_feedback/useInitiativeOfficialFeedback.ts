import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import initiativeOfficialFeedbackKeys from './keys';
import {
  IOfficialFeedbacks,
  InitiativeOfficialFeedbackKeys,
  IParameters,
} from './types';

const fetchOfficialFeedback = ({
  initiativeId,
  pageNumber,
  pageSize,
}: IParameters) =>
  fetcher<IOfficialFeedbacks>({
    path: `/initiatives/${initiativeId}/official_feedback`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 1,
    },
  });

const useInitiativeOfficialFeedback = (params: IParameters) => {
  return useInfiniteQuery<
    IOfficialFeedbacks,
    CLErrors,
    IOfficialFeedbacks,
    InitiativeOfficialFeedbackKeys
  >({
    queryKey: initiativeOfficialFeedbackKeys.list(params),
    queryFn: ({ pageParam }) => {
      return fetchOfficialFeedback({ ...params, pageNumber: pageParam });
    },
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage?.links?.next;
      const pageNumber = lastPage && getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    enabled: !!params?.initiativeId,
  });
};

export default useInitiativeOfficialFeedback;
