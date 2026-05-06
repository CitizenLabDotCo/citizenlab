import { useQuery } from '@tanstack/react-query';
import useGraphqlTenantLocales from 'modules/commercial/admin_project_templates/admin/api/useGraphqlTenantLocales';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

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
    queryKey: ['participationLevels', graphqlTenantLocales],
    queryFn: () =>
      graphqlFetcher({
        query: PARTICIPATION_LEVELS_QUERY,
      }),
    enabled: graphqlTenantLocales !== null,
    select: (data) => data.participationLevels.nodes, // Transform to return just the nodes array
  });
};

export default useParticipationLevels;
