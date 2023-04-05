import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
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

const useIdeaOfficialFeedback = ({ ideaId }: IParameters) => {
  return useInfiniteQuery<
    IOfficialFeedbacks,
    CLErrors,
    IOfficialFeedbacks,
    IdeaOfficialFeedbackKeys
  >({
    queryKey: ideaOfficialFeedbackKeys.list({
      ideaId,
    }),
    queryFn: () => fetchOfficialFeedback({ ideaId }),
    enabled: !!ideaId,
  });
};

export default useIdeaOfficialFeedback;
