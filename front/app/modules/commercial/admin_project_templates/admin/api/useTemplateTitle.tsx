import { useQuery } from '@tanstack/react-query';

import useLocale from 'hooks/useLocale';

import { convertToGraphqlLocale } from 'utils/helperUtils';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

const useTemplateTitle = (projectTemplateId?: string | null) => {
  const locale = useLocale();
  const graphqlLocale = convertToGraphqlLocale(locale);
  const localeFields = graphqlLocale === 'en' ? 'en' : `${graphqlLocale} en`;

  const TEMPLATE_TITLE_QUERY = `
    query ProjectTemplateTitle($id: ID!) {
      projectTemplate(id: $id) {
        titleMultiloc {
          ${localeFields}
        }
      }
    }
  `;

  return useQuery({
    queryKey: ['projectTemplateTitle', projectTemplateId, locale],
    queryFn: () =>
      graphqlFetcher({
        query: TEMPLATE_TITLE_QUERY,
        variables: { id: projectTemplateId },
      }),
    enabled: !!projectTemplateId,
  });
};

export default useTemplateTitle;
