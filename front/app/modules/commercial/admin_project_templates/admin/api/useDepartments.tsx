import { useQuery } from '@tanstack/react-query';
import useGraphqlTenantLocales from 'modules/commercial/admin_project_templates/admin/api/useGraphqlTenantLocales';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

const useDepartments = () => {
  const graphqlTenantLocales = useGraphqlTenantLocales();

  const DEPARTMENTS_QUERY = `
    {
      departments {
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
    queryKey: ['departments'],
    queryFn: () => graphqlFetcher({ query: DEPARTMENTS_QUERY }),
    select: (data) => data.departments.nodes, // Transform to return just the nodes array
  });
};

export default useDepartments;
