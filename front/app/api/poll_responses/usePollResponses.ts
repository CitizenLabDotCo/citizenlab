import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollOptionsKeys from './keys';
import {
  IPollResponses,
  PollResponsesKeys,
  IPollResponseParameters,
} from './types';

const fetchResponses = ({ phaseId }: IPollResponseParameters) =>
  fetcher<IPollResponses>({
    path: `/phases/${phaseId}/poll_responses/responses_count`,
    action: 'get',
  });

const usePollResponses = ({ phaseId }: IPollResponseParameters) => {
  return useQuery<IPollResponses, CLErrors, IPollResponses, PollResponsesKeys>({
    queryKey: pollOptionsKeys.item({
      phaseId,
    }),
    queryFn: () => fetchResponses({ phaseId }),
  });
};

export default usePollResponses;
