import { useInfiniteQuery } from '@tanstack/react-query';

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
  graphqlTenantLocales: string[];
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
  graphqlTenantLocales,
}: PublishedProjectTemplatesArgs) => {
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
            ${graphqlTenantLocales}
          }
          subtitleMultiloc {
            ${graphqlTenantLocales}
          }
          departments {
            id
            titleMultiloc {
              ${graphqlTenantLocales}
            }
          }
          purposes {
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
