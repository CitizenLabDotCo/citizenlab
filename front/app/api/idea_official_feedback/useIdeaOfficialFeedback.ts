import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import ideaOfficialFeedbackKeys from './keys';
import {
  IOfficialFeedbacks,
  IdeaOfficialFeedbackKeys,
  IParameters,
} from './types';

const fetchOfficialFeedback = ({ ideaId, pageNumber, pageSize }: IParameters) =>
  fetcher<IOfficialFeedbacks>({
    path: `/ideas/${ideaId}/official_feedback`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 1,
    },
  });

const useIdeaOfficialFeedback = (params: IParameters) => {
  return useInfiniteQuery<
    IOfficialFeedbacks,
    CLErrors,
    IOfficialFeedbacks,
    IdeaOfficialFeedbackKeys
  >({
    queryKey: ideaOfficialFeedbackKeys.list(params),
    queryFn: ({ pageParam }) => {
      return fetchOfficialFeedback({ ...params, pageNumber: pageParam });
    },
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage?.links?.next;
      const pageNumber = lastPage && getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    enabled: !!params?.ideaId,
  });
};

export default useIdeaOfficialFeedback;
