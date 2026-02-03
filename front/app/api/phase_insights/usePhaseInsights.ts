import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import phaseInsightsKeys from './keys';
import { IPhaseInsights } from './types';

const fetchPhaseInsights = (phaseId: string) =>
  fetcher<IPhaseInsights>({
    path: `/phases/${phaseId}/insights`,
    action: 'get',
  });

interface UsePhaseInsightsParams {
  phaseId: string;
}

const usePhaseInsights = ({ phaseId }: UsePhaseInsightsParams) => {
  return useQuery<IPhaseInsights, CLErrors, IPhaseInsights>({
    queryKey: phaseInsightsKeys.item({ phaseId }),
    queryFn: () => fetchPhaseInsights(phaseId),
    enabled: !!phaseId,
  });
};

export default usePhaseInsights;
