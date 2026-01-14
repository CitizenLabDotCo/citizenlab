import { useQuery } from '@tanstack/react-query';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

type ProjectTemplatePreviewArgs = {
  projectTemplateId: string | null | undefined;
  graphqlTenantLocales: string[];
};

const useProjectTemplatePreview = ({
  projectTemplateId,
  graphqlTenantLocales,
}: ProjectTemplatePreviewArgs) => {
  const PROJECT_TEMPLATE_QUERY = `
  query ProjectTemplate($id: ID!) {
    projectTemplate(id: $id) {
      id
      headerImage
      departments {
        id
        titleMultiloc {
          ${graphqlTenantLocales}
        }
      }
      participationLevels {
        id
        titleMultiloc {
          ${graphqlTenantLocales}
        }
      }
      phases {
        ${graphqlTenantLocales}
      }
      purposes {
        id
        titleMultiloc {
          ${graphqlTenantLocales}
        }
      }
      titleMultiloc {
        ${graphqlTenantLocales}
      }
      subtitleMultiloc {
        ${graphqlTenantLocales}
      }
      descriptionMultilocs {
        content
        locale
      }
      successCases {
        id
        href
        image
      }
    }
  }
`;

  return useQuery({
    queryKey: ['projectTemplate', projectTemplateId],
    queryFn: () =>
      graphqlFetcher({
        query: PROJECT_TEMPLATE_QUERY,
        variables: { id: projectTemplateId },
      }),
    enabled: !!projectTemplateId,
  });
};

export default useProjectTemplatePreview;
