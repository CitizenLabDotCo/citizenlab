import { useQuery } from '@tanstack/react-query';
import { Multiloc } from 'typings';

import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

interface Purpose {
  id: string;
  titleMultiloc: Multiloc;
}

interface PurposesResponse {
  purposes: {
    nodes: Purpose[];
  };
}

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

  return useQuery<PurposesResponse, Error, Purpose[]>({
    queryKey: ['purposes'],
    queryFn: () => graphqlFetcher({ query: PURPOSES_QUERY }),
    select: (data) => data.purposes.nodes, // Transform to return just the nodes array
  });
};

export default usePurposes;
