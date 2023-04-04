import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import causesKeys from './keys';
import { IOfficialFeedbacks, IdeaOfficialFeedbackKeys } from './types';

const fetchOfficialFeedback = ({ ideaId }: { ideaId: string }) =>
  fetcher<IOfficialFeedbacks>({
    path: `/ideas/${ideaId}/official_feedback`,
    action: 'get',
  });

const useIdeaOfficialFeedback = ({ ideaId }: { ideaId: string }) => {
  return useQuery<
    IOfficialFeedbacks,
    CLErrors,
    IOfficialFeedbacks,
    IdeaOfficialFeedbackKeys
  >({
    queryKey: causesKeys.list({
      ideaId,
    }),
    queryFn: () => fetchOfficialFeedback({ ideaId }),
  });
};

export default useIdeaOfficialFeedback;
