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
  enabled?: boolean;
}

const usePhaseInsights = ({
  phaseId,
  enabled = true,
}: UsePhaseInsightsParams) => {
  return useQuery<IPhaseInsights, CLErrors, IPhaseInsights>({
    queryKey: phaseInsightsKeys.item({ phaseId }),
    queryFn: () => fetchPhaseInsights(phaseId),
    enabled: enabled && !!phaseId,
    // Participation can change while managers are on another tab.
    staleTime: 0,
  });
};

export default usePhaseInsights;
