import React, { useState } from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';
import styled from 'styled-components';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { IStatusCounts } from 'api/admin_publications_status_counts/types';
import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';
import getStatusCounts from 'api/admin_publications_status_counts/util/getAdminPublicationsStatusCount';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
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

import messages from './messages';
import Placeholder from './Placeholder';
import Settings from './Settings';
import { ProjectsByFilterProps, ProjectsFilterType } from './types';

const ProjectSection = styled.div`
  width: 100%;

  ${media.tablet`
    padding-left: ${DEFAULT_PADDING};
    padding-right: ${DEFAULT_PADDING};
  `}
`;

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
    <Box maxWidth="1200px" margin="0 auto">
      <ProjectSection>
        <ProjectAndFolderCardsInner
          statusCounts={allStatusCountsWithoutFilters}
          showTitle={false}
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
      </ProjectSection>
    </Box>
  );
};

const ProjectsByFilter = ({
  filterType = 'global_topics',
  ids = [],
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
