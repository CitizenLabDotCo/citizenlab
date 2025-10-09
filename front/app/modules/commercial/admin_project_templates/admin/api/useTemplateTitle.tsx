import { useQuery } from '@tanstack/react-query';
import { Multiloc } from 'component-library/utils/typings';

import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

interface ProjectTemplateTitle {
  projectTemplate: {
    titleMultiloc: Multiloc;
  };
}

const useTemplateTitle = (projectTemplateId?: string | null) => {
  const graphqlTenantLocales = useGraphqlTenantLocales();

  const TEMPLATE_TITLE_QUERY = `
    query ProjectTemplateTitle($id: ID!) {
      projectTemplate(id: $id) {
        titleMultiloc {
          ${graphqlTenantLocales}
        }
      }
    }
  `;

  return useQuery({
    queryKey: ['projectTemplateTitle', projectTemplateId],
    queryFn: () =>
      graphqlFetcher<ProjectTemplateTitle>({
        query: TEMPLATE_TITLE_QUERY,
        variables: { id: projectTemplateId },
      }),
    enabled: !!projectTemplateId,
  });
};

export default useTemplateTitle;
