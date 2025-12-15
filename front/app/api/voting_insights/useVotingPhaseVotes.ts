import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { DemographicOption } from 'api/phase_insights/types';

import fetcher from 'utils/cl-react-query/fetcher';

import votingInsightsKeys from './keys';
import {
  VotingPhaseVotes,
  TransformedVotingPhaseVotes,
  BackendDemographicOption,
  GroupByOption,
} from './types';

/**
 * Transforms backend options array to frontend record format
 * Backend: [{ male: { id, title_multiloc }, ordering: 0 }, ...]
 * Frontend: { male: { title_multiloc, ordering }, ... }
 */
const transformOptions = (
  options?: BackendDemographicOption[]
): Record<string, DemographicOption> | undefined => {
  if (!options || options.length === 0) return undefined;

  return options.reduce((acc, opt) => {
    const ordering = typeof opt.ordering === 'number' ? opt.ordering : 0;
    const key = Object.keys(opt).find((k) => k !== 'ordering');
    if (key) {
      const value = opt[key];
      if (typeof value === 'object' && 'title_multiloc' in value) {
        acc[key] = {
          title_multiloc: value.title_multiloc,
          ordering,
        };
      }
    }
    return acc;
  }, {} as Record<string, DemographicOption>);
};

/**
 * Transforms backend response to frontend format
 * - Converts options from array to record format
 */
const transformResponse = (
  response: VotingPhaseVotes
): TransformedVotingPhaseVotes => {
  return {
    data: {
      ...response.data,
      attributes: {
        ...response.data.attributes,
        options: transformOptions(response.data.attributes.options),
      },
    },
  };
};

/**
 * Fetches Voting phase votes from the backend
 * Returns full JSONAPI response structure
 */
const fetchVotingPhaseVotes = async ({
  phaseId,
  groupBy,
}: {
  phaseId: string;
  groupBy?: GroupByOption;
}): Promise<TransformedVotingPhaseVotes> => {
  const params = new URLSearchParams();
  if (groupBy) params.append('group_by', groupBy);

  const queryString = params.toString();
  const path = `/phases/${phaseId}/insights/voting${
    queryString ? `?${queryString}` : ''
  }` as `/${string}`;

  const response = await fetcher<VotingPhaseVotes>({
    path,
    action: 'get',
  });

  return transformResponse(response);
};

interface UseVotingPhaseVotesParams {
  phaseId: string;
  groupBy?: GroupByOption;
  enabled?: boolean;
}

/**
 * Hook to fetch Voting phase votes insights
 * Returns standard React Query result with full JSONAPI structure
 * Access results via: data.data.attributes
 *
 * @param phaseId - Phase ID to fetch results for
 * @param groupBy - Demographic grouping option (gender, birthyear, domicile)
 * @param enabled - Whether the query should run (defaults to true if phaseId exists)
 */
const useVotingPhaseVotes = ({
  phaseId,
  groupBy,
  enabled = true,
}: UseVotingPhaseVotesParams) => {
  return useQuery<
    TransformedVotingPhaseVotes,
    CLErrors,
    TransformedVotingPhaseVotes
  >({
    queryKey: votingInsightsKeys.item({ phaseId, groupBy }),
    queryFn: () => fetchVotingPhaseVotes({ phaseId, groupBy }),
    enabled: enabled && !!phaseId,
  });
};

export default useVotingPhaseVotes;
