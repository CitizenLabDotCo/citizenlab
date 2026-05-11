import { useInfiniteQuery } from '@tanstack/react-query';
import { SupportedLocale } from 'typings';

import { convertToGraphqlLocale } from 'utils/helperUtils';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

interface PublishedProjectTemplatesArgs {
  departments?: string[] | null;
  purposes?: string[] | null;
  participationLevels?: string[] | null;
  search?: string | null;
  locales?: string[] | null;
  organizationTypes?:
    | 'small_city'
    | 'medium_city'
    | 'large_city'
    | 'generic'
    | null;
  locale: SupportedLocale;
}

type PublishedProjectTemplatesResponse = {
  publishedProjectTemplates: {
    nodes: {
      id: string;
      cardImage: string | null;
      titleMultiloc: { [key: string]: string };
      subtitleMultiloc: { [key: string]: string };
      departments: {
        id: string;
        titleMultiloc: { [key: string]: string };
      }[];
      purposes: {
        id: string;
        titleMultiloc: { [key: string]: string };
      }[];
      participationLevels: {
        id: string;
        titleMultiloc: { [key: string]: string };
      }[];
    }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

const usePublishedProjectTemplates = ({
  departments,
  purposes,
  participationLevels,
  search,
  locales,
  organizationTypes,
  locale,
}: PublishedProjectTemplatesArgs) => {
  const graphqlLocale = convertToGraphqlLocale(locale);
  const localeFields = graphqlLocale === 'en' ? 'en' : `${graphqlLocale} en`;

  const PUBLISHED_PROJECT_TEMPLATES_QUERY = `
    query PublishedProjectTemplates(
      $departments: [ID!]
      $purposes: [ID!]
      $participationLevels: [ID!]
      $search: String
      $after: String
      $locales: [String!]
      $organizationTypes: [String!]
    ) {
      publishedProjectTemplates(
        departments: $departments
        purposes: $purposes
        participationLevels: $participationLevels
        search: $search
        first: 12
        after: $after
        locales: $locales
        organizationTypes: $organizationTypes
      ) {
        nodes {
          id
          cardImage
          titleMultiloc {
            ${localeFields}
          }
          subtitleMultiloc {
            ${localeFields}
          }
          departments {
            id
            titleMultiloc {
              ${localeFields}
            }
          }
          purposes {
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
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  return useInfiniteQuery({
    queryKey: [
      'publishedProjectTemplates',
      {
        departments,
        purposes,
        participationLevels,
        search,
        locales,
        organizationTypes,
        locale,
      },
    ],
    queryFn: ({ pageParam = null }) =>
      graphqlFetcher<PublishedProjectTemplatesResponse>({
        query: PUBLISHED_PROJECT_TEMPLATES_QUERY,
        variables: {
          departments,
          purposes,
          participationLevels,
          search,
          after: pageParam,
          locales,
          organizationTypes,
        },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.publishedProjectTemplates.pageInfo.hasNextPage
        ? lastPage.publishedProjectTemplates.pageInfo.endCursor
        : undefined,
  });
};

export default usePublishedProjectTemplates;
