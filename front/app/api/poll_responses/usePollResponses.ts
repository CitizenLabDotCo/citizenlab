import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import pollOptionsKeys from './keys';
import {
  IPollResponses,
  PollResponsesKeys,
  IPollResponseParameters,
} from './types';

const fetchResponses = ({
  participationContextId,
  participationContextType,
}: IPollResponseParameters) =>
  fetcher<IPollResponses>({
    path: `/${participationContextType}s/${participationContextId}/poll_responses/responses_count`,
    action: 'get',
  });

const usePollResponses = ({
  participationContextId,
  participationContextType,
}: IPollResponseParameters) => {
  return useQuery<IPollResponses, CLErrors, IPollResponses, PollResponsesKeys>({
    queryKey: pollOptionsKeys.item({
      participationContextId,
      participationContextType,
    }),
    queryFn: () =>
      fetchResponses({ participationContextId, participationContextType }),
  });
};

export default usePollResponses;
