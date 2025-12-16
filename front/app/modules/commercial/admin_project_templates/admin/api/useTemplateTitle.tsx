import { useQuery } from '@tanstack/react-query';
import useGraphqlTenantLocales from 'modules/commercial/admin_project_templates/admin/api/useGraphqlTenantLocales';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

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
      graphqlFetcher({
        query: TEMPLATE_TITLE_QUERY,
        variables: { id: projectTemplateId },
      }),
    enabled: !!projectTemplateId,
  });
};

export default useTemplateTitle;
