import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import causesKeys from './keys';
import { ICauses, CausesKeys, ICauseParameters } from './types';

const fetchCauses = ({ phaseId }: ICauseParameters) =>
  fetcher<ICauses>({
    path: `/phases/${phaseId}/causes`,
    action: 'get',
  });

const useCauses = ({ phaseId }: ICauseParameters) => {
  return useQuery<ICauses, CLErrors, ICauses, CausesKeys>({
    queryKey: causesKeys.list({
      phaseId,
    }),
    queryFn: () => fetchCauses({ phaseId }),
  });
};

export default useCauses;
