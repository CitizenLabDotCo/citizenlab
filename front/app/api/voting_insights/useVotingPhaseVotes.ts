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
 * Transforms backend demographic options format to frontend format.
 * Backend format: [{ ordering: 0, gender: { id: '...', title_multiloc: {...} } }, ...]
 * Frontend format: { gender: { title_multiloc: {...}, ordering: 0 }, ... }
 */
const transformOptions = (
  options?: BackendDemographicOption[]
): Record<string, DemographicOption> | undefined => {
  if (!options || options.length === 0) return undefined;

  return options.reduce((acc, opt) => {
    const ordering = opt.ordering ?? 0;

    // Find the key that is not 'ordering'
    const key = Object.keys(opt).find((k) => k !== 'ordering');

    if (key) {
      const value = opt[key];

      if (
        typeof value === 'object' &&
        'title_multiloc' in value &&
        typeof (value as { title_multiloc: unknown }).title_multiloc ===
          'object'
      ) {
        const demographicValue = value as {
          id: string;
          title_multiloc: Record<string, string>;
        };
        acc[key] = {
          title_multiloc: demographicValue.title_multiloc,
          ordering,
        };
      }
    }
    return acc;
  }, {} as Record<string, DemographicOption>);
};

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
