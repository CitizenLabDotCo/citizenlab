import React, { ReactElement, memo, useState, useCallback } from 'react';
import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';
import { isNilOrError } from 'utils/helperUtils';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAppConfigurationLocales from 'hooks/useTenantLocales';
import { trackEventByName } from 'utils/analytics';
import { get, isEmpty } from 'lodash-es';
import tracks from './tracks';

import ProjectTemplateCards from './ProjectTemplateCards';

interface Props {
  className?: string;
  graphqlTenantLocales: string[];
}

const ProjectTemplatesContainer = memo(
  ({ graphqlTenantLocales, className }: Props): ReactElement => {
    const tenant = useAppConfiguration();

    const locales = !isNilOrError(tenant)
      ? tenant.data.attributes.settings.core.locales
      : null;
    const organizationTypes = !isNilOrError(tenant)
      ? tenant.data.attributes.settings.core.organization_type
      : null;

    const [departments, setDepartments] = useState<string[] | null>(null);
    const [purposes, setPurposes] = useState<string[] | null>(null);
    const [participationLevels, setParticipationLevels] = useState<
      string[] | null
    >(null);
    const [search, setSearch] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const tenantLocales = useAppConfigurationLocales();

    const TEMPLATES_QUERY = gql`
    query PublishedProjectTemplatesQuery(
      $cursor: String,
      $departments: [ID!],
      $purposes: [ID!],
      $participationLevels: [ID!],
      $search: String,
      $locales: [String!],
      $organizationTypes: [String!]
    ) {
      publishedProjectTemplates(
        first: 24,
        after: $cursor,
        departments: $departments,
        purposes: $purposes,
        participationLevels: $participationLevels,
        search: $search,
        locales: $locales,
        organizationTypes: $organizationTypes
      ) {
        edges {
          node {
            id,
            cardImage,
            titleMultiloc {
              ${graphqlTenantLocales}
            },
            subtitleMultiloc {
              ${graphqlTenantLocales}
            }
          }
          cursor
        }
        pageInfo{
          endCursor
          hasNextPage
        }
      }
    }
  `;
    const { loading, data, fetchMore } = useQuery(TEMPLATES_QUERY, {
      variables: {
        departments,
        purposes,
        participationLevels,
        search,
        organizationTypes,
        cursor: null,
        locales: tenantLocales,
      },
    });

    const templates = get(data, 'publishedProjectTemplates', null);

    const handleLoadMoreTemplatesOnClick = useCallback(async () => {
      trackEventByName(tracks.templatesLoadMoreButtonClicked);
      setLoadingMore(true);

      try {
        await fetchMore({
          variables: {
            departments,
            purposes,
            participationLevels,
            search,
            locales,
            organizationTypes,
            cursor: templates.pageInfo.endCursor,
          },
          updateQuery: (
            previousResult,
            { fetchMoreResult }: { fetchMoreResult: any }
          ) => {
            const newEdges = fetchMoreResult.publishedProjectTemplates.edges;
            const pageInfo = fetchMoreResult.publishedProjectTemplates.pageInfo;

            return newEdges.length
              ? {
                  publishedProjectTemplates: {
                    pageInfo,
                    __typename: templates.__typename,
                    edges: [...templates.edges, ...newEdges],
                  },
                }
              : previousResult;
          },
        });
        setLoadingMore(false);
      } catch {
        setLoadingMore(false);
      }
    }, [templates]);

    const handleDepartmentFilterOnChange = useCallback(
      (departments: string[]) => {
        trackEventByName(tracks.departmentFilterChanged, { departments });
        setDepartments(
          departments && departments.length > 0 ? departments : null
        );
      },
      []
    );

    const handlePurposeFilterOnChange = useCallback((purposes: string[]) => {
      trackEventByName(tracks.purposeFilterChanged, { purposes });
      setPurposes(purposes && purposes.length > 0 ? purposes : null);
    }, []);

    const handleParticipationLevelFilterOnChange = useCallback(
      (participationLevels: string[]) => {
        trackEventByName(tracks.participationLevelFilterChanged, {
          participationLevels,
        });
        setParticipationLevels(
          participationLevels && participationLevels.length > 0
            ? participationLevels
            : null
        );
      },
      []
    );

    const handleSearchOnChange = useCallback((searchValue: string) => {
      trackEventByName(tracks.projectTemplatesSearchValueChanged, {
        searchValue,
      });
      setSearch(!isEmpty(searchValue) ? searchValue : null);
    }, []);

    return (
      <ProjectTemplateCards
        templates={templates}
        className={className}
        loading={loading}
        onLoadMore={handleLoadMoreTemplatesOnClick}
        loadingMore={loadingMore}
        onSearchChange={handleSearchOnChange}
        onPurposeFilterChange={handlePurposeFilterOnChange}
        onDepartmentFilterChange={handleDepartmentFilterOnChange}
        onParticipationLevelFilterChange={
          handleParticipationLevelFilterOnChange
        }
      />
    );
  }
);

const ProjectTemplatesContainerWithGraphqlLocales = memo((props) => {
  const graphqlTenantLocales = useGraphqlTenantLocales();

  if (isNilOrError(graphqlTenantLocales)) return null;

  return (
    <ProjectTemplatesContainer
      graphqlTenantLocales={graphqlTenantLocales}
      {...props}
    />
  );
});

export default ProjectTemplatesContainerWithGraphqlLocales;
