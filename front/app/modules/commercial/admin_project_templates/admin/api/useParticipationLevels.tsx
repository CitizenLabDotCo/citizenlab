import { useQuery } from '@tanstack/react-query';

import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

import { MultilocWithId } from './types';

interface ParticipationLevelsResponse {
  participationLevels: {
    nodes: MultilocWithId[];
  };
}

const useParticipationLevels = () => {
  const graphqlTenantLocales = useGraphqlTenantLocales();

  const PARTICIPATION_LEVELS_QUERY = `
    {
      participationLevels {
        nodes {
          id
          titleMultiloc {
            ${graphqlTenantLocales}
          }
        }
      }
    }
  `;

  return useQuery({
    queryKey: ['participationLevels'],
    queryFn: () =>
      graphqlFetcher<ParticipationLevelsResponse>({
        query: PARTICIPATION_LEVELS_QUERY,
      }),
    select: (data) => data.participationLevels.nodes, // Transform to return just the nodes array
  });
};

export default useParticipationLevels;
