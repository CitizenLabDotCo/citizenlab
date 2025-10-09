import { useQuery } from '@tanstack/react-query';
import { Multiloc } from 'typings';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

import { MultilocWithId } from './types';

interface DescriptionMultiloc {
  content: string;
  locale: string;
}

interface SuccessCase {
  id: string;
  href: string;
  image: string;
}

interface ProjectTemplatePreviewResponse {
  projectTemplate: {
    id: string;
    headerImage: string;
    departments: MultilocWithId[];
    participationLevels: MultilocWithId[];
    phases: Multiloc;
    purposes: MultilocWithId[];
    titleMultiloc: Multiloc;
    subtitleMultiloc: Multiloc;
    descriptionMultilocs: DescriptionMultiloc[];
    successCases: SuccessCase[];
  };
}

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
      graphqlFetcher<ProjectTemplatePreviewResponse>({
        query: PROJECT_TEMPLATE_QUERY,
        variables: { id: projectTemplateId },
      }),
    enabled: !!projectTemplateId,
  });
};

export default useProjectTemplatePreview;
