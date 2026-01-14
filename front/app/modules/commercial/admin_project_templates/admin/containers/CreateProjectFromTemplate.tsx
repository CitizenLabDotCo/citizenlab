import React, { ReactElement, memo, useState, useCallback } from 'react';

import { isEmpty } from 'lodash-es';
import useGraphqlTenantLocales from 'modules/commercial/admin_project_templates/admin/api/useGraphqlTenantLocales';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { trackEventByName } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';

import tracks from '../../tracks';
import { Templates } from '../../types';
import usePublishedProjectTemplates from '../api/usePublishedProjectTemplates';
import ProjectTemplateCards from '../components/ProjectTemplateCards';
interface Props {
  className?: string;
  graphqlTenantLocales: string[];
}

const CreateProjectFromTemplate = memo(
  ({ graphqlTenantLocales, className }: Props): ReactElement => {
    const { data: appConfig } = useAppConfiguration();

    const organizationTypes = !isNilOrError(appConfig)
      ? appConfig.data.attributes.settings.core.organization_type
      : null;

    const [departments, setDepartments] = useState<string[] | null>(null);
    const [purposes, setPurposes] = useState<string[] | null>(null);
    const [participationLevels, setParticipationLevels] = useState<
      string[] | null
    >(null);
    const [search, setSearch] = useState<string | null>(null);

    const tenantLocales = useAppConfigurationLocales();

    const {
      data,
      isLoading: loading,
      fetchNextPage,
      isFetchingNextPage,
    } = usePublishedProjectTemplates({
      departments,
      purposes,
      participationLevels,
      search,
      locales: tenantLocales,
      organizationTypes,
      graphqlTenantLocales,
    });

    // Transform the infinite query data to match the expected structure
    const templates: Templates = data
      ? {
          edges: data.pages.flatMap((page) =>
            page.publishedProjectTemplates.nodes.map((node) => ({
              node,
              cursor: node.id, // Use node id as cursor fallback
            }))
          ),
          pageInfo: {
            hasNextPage: Boolean(
              data.pages[data.pages.length - 1]?.publishedProjectTemplates
                .pageInfo.hasNextPage
            ),
            endCursor:
              data.pages[data.pages.length - 1]?.publishedProjectTemplates
                .pageInfo.endCursor,
          },
        }
      : null;

    const handleLoadMoreTemplatesOnClick = useCallback(async () => {
      trackEventByName(tracks.templatesLoadMoreButtonClicked);
      fetchNextPage();
    }, [fetchNextPage]);

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
        loadingMore={isFetchingNextPage}
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
