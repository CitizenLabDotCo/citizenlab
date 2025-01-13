import React, { ReactElement, memo, useState, useCallback } from 'react';

import { gql, useQuery } from '@apollo/client';
import { get, isEmpty } from 'lodash-es';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';

import { trackEventByName } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';

import tracks from '../../tracks';
import { client } from '../../utils/apolloUtils';
import ProjectTemplateCards from '../components/ProjectTemplateCards';

interface Props {
  className?: string;
  graphqlTenantLocales: string[];
}

const CreateProjectFromTemplate = memo(
  ({ graphqlTenantLocales, className }: Props): ReactElement => {
    const { data: appConfig } = useAppConfiguration();

    const locales = !isNilOrError(appConfig)
      ? appConfig.data.attributes.settings.core.locales
      : null;
    const organizationTypes = !isNilOrError(appConfig)
      ? appConfig.data.attributes.settings.core.organization_type
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
      client,
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templates]);

    const handleDepartmentFilterOnChange = useCallback(
      (departments: string[]) => {
        trackEventByName(tracks.departmentFilterChanged, {
          departments: departments.toString(),
        });
        setDepartments(
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          departments && departments.length > 0 ? departments : null
        );
      },
      []
    );

    const handlePurposeFilterOnChange = useCallback((purposes: string[]) => {
      trackEventByName(tracks.purposeFilterChanged, {
        purposes: purposes.toString(),
      });
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      setPurposes(purposes && purposes.length > 0 ? purposes : null);
    }, []);

    const handleParticipationLevelFilterOnChange = useCallback(
      (participationLevels: string[]) => {
        trackEventByName(tracks.participationLevelFilterChanged, {
          participationLevels: participationLevels.toString(),
        });
        setParticipationLevels(
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

const CreateProjectFromTemplateWithGraphqlLocales = memo((props) => {
  const graphqlTenantLocales = useGraphqlTenantLocales();

  if (isNilOrError(graphqlTenantLocales)) return null;

  return (
    <CreateProjectFromTemplate
      graphqlTenantLocales={graphqlTenantLocales}
      {...props}
    />
  );
});

export default CreateProjectFromTemplateWithGraphqlLocales;
