import { useInfiniteQuery } from '@tanstack/react-query';
import {
  IParameters,
  IOfficialFeedbacks,
  InitiativeOfficialFeedbackKeys,
} from './types';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeOfficialFeedbackKeys from './keys';

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

const useInitiativeOfficialFeedback = ({ initiativeId }: IParameters) => {
  return useInfiniteQuery<
    IOfficialFeedbacks,
    CLErrors,
    IOfficialFeedbacks,
    InitiativeOfficialFeedbackKeys
  >({
    queryKey: initiativeOfficialFeedbackKeys.list({
      initiativeId,
    }),
    queryFn: () => fetchOfficialFeedback({ initiativeId }),
    enabled: !!initiativeId,
  });
};

export default useInitiativeOfficialFeedback;
