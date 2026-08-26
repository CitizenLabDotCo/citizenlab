import React, { useState } from 'react';

import { useEditor } from '@craftjs/core';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { IStatusCounts } from 'api/admin_publications_status_counts/types';
import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';
import getStatusCounts from 'api/admin_publications_status_counts/util/getAdminPublicationsStatusCount';

import ContentContainer from 'components/ContentContainer';
import {
  PublicationTab,
  PUBLICATION_STATUSES,
} from 'components/ProjectAndFolderCards';
import ProjectAndFolderCardsInner from 'components/ProjectAndFolderCards/ProjectAndFolderCardsInner';
import {
  getCurrentTab,
  getPublicationStatuses,
} from 'components/ProjectAndFolderCards/utils';

import { FormattedMessage } from 'utils/cl-intl';

import Placeholder from '../Placeholder';

import messages from './messages';
import Settings from './Settings';
import { hasTitle, ProjectsByFilterProps, ProjectsFilterType } from './types';

// Only the selected dimension is sent; the others stay absent so they do not narrow the
// result set. Spaces also carry folders, so they page over top-level publications while the
// other two page over projects.
const queryFilters = (filterType: ProjectsFilterType, ids: string[]) => ({
  globalTopics: filterType === 'global_topics' ? ids : undefined,
  areaIds: filterType === 'areas' ? ids : undefined,
  spaceIds: filterType === 'spaces' ? ids : undefined,
  rootLevelOnly: filterType === 'spaces',
  onlyProjects: filterType !== 'spaces',
  removeNotAllowedParents: true,
});

type InnerProps = ProjectsByFilterProps & {
  statusCountsWithoutFilters: IStatusCounts;
};

const ProjectsByFilterInner = ({
  filterType,
  ids,
  titleMultiloc,
  statusCountsWithoutFilters,
}: InnerProps) => {
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
    // Same container the page section used, so the cards keep their page alignment. Its
    // 50px vertical padding is deliberately not carried over: inside the builder, spacing
    // between widgets is VerticalRhythmContext's job.
    <ContentContainer mode="page">
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
    </ContentContainer>
  );
};

const ProjectsByFilter = ({
  filterType = 'global_topics',
  ids = [],
  titleMultiloc = {},
}: Partial<ProjectsByFilterProps>) => {
  const { inBuilder } = useEditor((state) => ({
    inBuilder: state.options.enabled,
  }));

  const { data: statusCountsWithoutFilters } = useAdminPublicationsStatusCounts(
    {
      publicationStatusFilter: PUBLICATION_STATUSES,
      ...queryFilters(filterType, ids),
    },
    { enabled: ids.length > 0 }
  );

  if (ids.length === 0) {
    return inBuilder ? (
      <Placeholder>
        <FormattedMessage {...messages.nothingSelected} />
      </Placeholder>
    ) : null;
  }

  if (!statusCountsWithoutFilters) return null;

  return (
    <ProjectsByFilterInner
      filterType={filterType}
      ids={ids}
      titleMultiloc={titleMultiloc}
      statusCountsWithoutFilters={statusCountsWithoutFilters}
    />
  );
};

ProjectsByFilter.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.projects,
  },
};

export default ProjectsByFilter;
