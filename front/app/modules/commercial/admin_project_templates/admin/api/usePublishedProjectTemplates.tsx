import { useInfiniteQuery } from '@tanstack/react-query';
import { Multiloc } from 'typings';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

import { MultilocWithId } from './types';

interface ProjectTemplate {
  id: string;
  cardImage: string;
  titleMultiloc: Multiloc;
  subtitleMultiloc: Multiloc;
  departments: MultilocWithId[];
  purposes: MultilocWithId[];
  participationLevels: MultilocWithId[];
}

interface PublishedProjectTemplatesResponse {
  publishedProjectTemplates: {
    nodes: ProjectTemplate[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

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
