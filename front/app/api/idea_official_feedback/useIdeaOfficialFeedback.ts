import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideaOfficialFeedbackKeys from './keys';
import { IOfficialFeedbacks, IdeaOfficialFeedbackKeys } from './types';

const fetchOfficialFeedback = ({ ideaId }: { ideaId: string }) =>
  fetcher<IOfficialFeedbacks>({
    path: `/ideas/${ideaId}/official_feedback`,
    action: 'get',
  });

const useIdeaOfficialFeedback = ({ ideaId }: { ideaId: string }) => {
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
  });
};

export default useIdeaOfficialFeedback;
