import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { IStatusCounts } from 'api/admin_publications_status_counts/types';
import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';
import getStatusCounts from 'api/admin_publications_status_counts/util/getAdminPublicationsStatusCount';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import WidgetPlaceholder from 'components/admin/ContentBuilder/Widgets/WidgetPlaceholder';
import {
  PublicationTab,
  PUBLICATION_STATUSES,
} from 'components/ProjectAndFolderCards';
import ProjectAndFolderCardsInner from 'components/ProjectAndFolderCards/ProjectAndFolderCardsInner';
import {
  getCurrentTab,
  getPublicationStatuses,
} from 'components/ProjectAndFolderCards/utils';
import SectionBackground from 'components/ProjectPageBuilder/Widgets/SectionBackground';
import useIsPageBodyChild from 'components/ProjectPageBuilder/Widgets/useIsPageBodyChild';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';
import Settings from './Settings';
import { ProjectsByFilterProps, ProjectsFilterType } from './types';
import { hasTitle } from './utils';

// Spaces carry folders as well as projects, so they page over top-level publications while
// the other two page over projects.
const queryFilters = (filterType: ProjectsFilterType, ids: string[]) => ({
  globalTopics: filterType === 'global_topics' ? ids : undefined,
  areaIds: filterType === 'areas' ? ids : undefined,
  spaceIds: filterType === 'spaces' ? ids : undefined,
  rootLevelOnly: filterType === 'spaces',
  onlyProjects: filterType !== 'spaces',
  removeNotAllowedParents: true,
});

type InnerProps = Omit<ProjectsByFilterProps, 'sectionBackground'> & {
  statusCountsWithoutFilters: IStatusCounts;
};

const ProjectsByFilterInner = ({
  filterType,
  ids,
  titleMultiloc,
  statusCountsWithoutFilters,
}: InnerProps) => {
  const padding = useCraftComponentDefaultPadding();
  const allStatusCountsWithoutFilters = getStatusCounts(
    statusCountsWithoutFilters
  );
  const [currentTab, setCurrentTab] = useState<PublicationTab>(
    getCurrentTab(allStatusCountsWithoutFilters)
  );

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAdminPublications({
      pageSize: 6,
      publicationStatusFilter: getPublicationStatuses(currentTab),
      remove_all_unlisted: true,
      ...queryFilters(filterType, ids),
    });

  const adminPublications = data?.pages.map((page) => page.data).flat();

  return (
    // The width every builder widget uses, so the page lines up on one edge.
    <Box maxWidth="1200px" margin="0 auto" px={padding}>
      <ProjectAndFolderCardsInner
        statusCounts={allStatusCountsWithoutFilters}
        showTitle={hasTitle(titleMultiloc)}
        currentlyWorkingOnText={titleMultiloc}
        showFilters={false}
        showSearch={false}
        adminPublications={adminPublications || []}
        statusCountsWithoutFilters={allStatusCountsWithoutFilters}
        layout="dynamic"
        loadingInitial={isLoading}
        loadingMore={isFetchingNextPage}
        hasMore={hasNextPage}
        currentTab={currentTab}
        onLoadMore={fetchNextPage}
        onChangeCurrentTab={setCurrentTab}
      />
    </Box>
  );
};

const ProjectsByFilter = ({
  filterType = 'global_topics',
  ids = [],
  titleMultiloc = {},
  sectionBackground = 'white',
}: Partial<ProjectsByFilterProps>) => {
  const { inBuilder } = useEditor((state) => ({
    inBuilder: state.options.enabled,
  }));
  // Only the front-office route carries a slug, so a coloured band bleeds to the viewport
  // edge there but not in the builder canvas.
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const isPageBodyChild = useIsPageBodyChild('CustomPageBody');

  const { data: statusCountsWithoutFilters } = useAdminPublicationsStatusCounts(
    {
      publicationStatusFilter: PUBLICATION_STATUSES,
      ...queryFilters(filterType, ids),
    },
    { enabled: ids.length > 0 }
  );

  if (ids.length === 0) {
    return inBuilder ? (
      <WidgetPlaceholder iconName="projects">
        <FormattedMessage {...messages.nothingSelected} />
      </WidgetPlaceholder>
    ) : null;
  }

  if (!statusCountsWithoutFilters) return null;

  return (
    <SectionBackground
      colored={sectionBackground === 'colored'}
      fullBleed={!!slug && isPageBodyChild}
      py="40px"
    >
      <ProjectsByFilterInner
        filterType={filterType}
        ids={ids}
        titleMultiloc={titleMultiloc}
        statusCountsWithoutFilters={statusCountsWithoutFilters}
      />
    </SectionBackground>
  );
};

ProjectsByFilter.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.filteredProjects,
  },
};

export default ProjectsByFilter;
