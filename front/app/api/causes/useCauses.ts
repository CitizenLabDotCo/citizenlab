import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import causesKeys from './keys';
import { ICauses, CausesKeys, ICauseParameters } from './types';

const fetchCauses = ({
  participationContextType,
  participationContextId,
}: ICauseParameters) =>
  fetcher<ICauses>({
    path: `/${participationContextType}s/${participationContextId}/causes`,
    action: 'get',
  });

const useCauses = ({
  participationContextType,
  participationContextId,
}: ICauseParameters) => {
  return useQuery<ICauses, CLErrors, ICauses, CausesKeys>({
    queryKey: causesKeys.list({
      participationContextType,
      participationContextId,
    }),
    queryFn: () =>
      fetchCauses({ participationContextId, participationContextType }),
  });
};

export default useCauses;
