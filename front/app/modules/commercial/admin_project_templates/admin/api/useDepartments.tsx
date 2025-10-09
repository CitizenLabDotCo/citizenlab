import { useQuery } from '@tanstack/react-query';

import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

import { MultilocWithId } from './types';

interface DepartmentsResponse {
  departments: {
    nodes: MultilocWithId[];
  };
}

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
    queryFn: () =>
      graphqlFetcher<DepartmentsResponse>({ query: DEPARTMENTS_QUERY }),
    select: (data) => data.departments.nodes, // Transform to return just the nodes array
  });
};

export default useDepartments;
