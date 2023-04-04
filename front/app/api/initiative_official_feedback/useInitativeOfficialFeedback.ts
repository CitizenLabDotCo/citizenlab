import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import initiativeOfficialFeedbackKeys from './keys';
import { IOfficialFeedbacks, InitiativeOfficialFeedbackKeys } from './types';

const fetchOfficialFeedback = ({ initiativeId }: { initiativeId: string }) =>
  fetcher<IOfficialFeedbacks>({
    path: `/initiatives/${initiativeId}/official_feedback`,
    action: 'get',
  });

const useInitiativeOfficialFeedback = ({
  initiativeId,
}: {
  initiativeId: string;
}) => {
  return useQuery<
    IOfficialFeedbacks,
    CLErrors,
    IOfficialFeedbacks,
    InitiativeOfficialFeedbackKeys
  >({
    queryKey: initiativeOfficialFeedbackKeys.list({
      initiativeId,
    }),
    queryFn: () => fetchOfficialFeedback({ initiativeId }),
  });
};

export default useInitiativeOfficialFeedback;
