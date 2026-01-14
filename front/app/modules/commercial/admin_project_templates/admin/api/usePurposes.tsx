import { useQuery } from '@tanstack/react-query';
import useGraphqlTenantLocales from 'modules/commercial/admin_project_templates/admin/api/useGraphqlTenantLocales';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

const usePurposes = () => {
  const graphqlTenantLocales = useGraphqlTenantLocales();

  const PURPOSES_QUERY = `
    {
      purposes {
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
    queryKey: ['purposes'],
    queryFn: () => graphqlFetcher({ query: PURPOSES_QUERY }),
    select: (data) => data.purposes.nodes, // Transform to return just the nodes array
  });
};

export default usePurposes;
