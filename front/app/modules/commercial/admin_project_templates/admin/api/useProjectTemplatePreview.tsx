import { useQuery } from '@tanstack/react-query';
import { SupportedLocale } from 'typings';

import { convertToGraphqlLocale } from 'utils/helperUtils';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

type ProjectTemplatePreviewArgs = {
  projectTemplateId: string | null | undefined;
  locale: SupportedLocale;
};

const useProjectTemplatePreview = ({
  projectTemplateId,
  locale,
}: ProjectTemplatePreviewArgs) => {
  const graphqlLocale = convertToGraphqlLocale(locale);
  const localeFields = graphqlLocale === 'en' ? 'en' : `${graphqlLocale} en`;

  const PROJECT_TEMPLATE_QUERY = `
  query ProjectTemplate($id: ID!) {
    projectTemplate(id: $id) {
      id
      headerImage
      departments {
        id
        titleMultiloc {
          ${localeFields}
        }
      }
      participationLevels {
        id
        titleMultiloc {
          ${localeFields}
        }
      }
      phases {
        ${localeFields}
      }
      purposes {
        id
        titleMultiloc {
          ${localeFields}
        }
      }
      titleMultiloc {
        ${localeFields}
      }
      subtitleMultiloc {
        ${localeFields}
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
    queryKey: ['projectTemplate', projectTemplateId, locale],
    queryFn: () =>
      graphqlFetcher({
        query: PROJECT_TEMPLATE_QUERY,
        variables: { id: projectTemplateId },
      }),
    enabled: !!projectTemplateId,
  });
};

export default useProjectTemplatePreview;
