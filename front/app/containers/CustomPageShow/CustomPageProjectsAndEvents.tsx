import React, { useState } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { IStatusCounts } from 'api/admin_publications_status_counts/types';
import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';
import getStatusCounts from 'api/admin_publications_status_counts/util/getAdminPublicationsStatusCount';
import { ICustomPageData } from 'api/custom_pages/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ContentContainer from 'components/ContentContainer';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';
import {
  PublicationTab,
  PUBLICATION_STATUSES,
} from 'components/ProjectAndFolderCards';
import ProjectAndFolderCardsInner from 'components/ProjectAndFolderCards/ProjectAndFolderCardsInner';
import {
  getCurrentTab,
  getPublicationStatuses,
} from 'components/ProjectAndFolderCards/utils';

const ProjectCardsContentContainer = styled(ContentContainer)`
  padding-top: 50px;
  padding-bottom: 50px;
`;

const EventsContentContainer = styled(ContentContainer)<{
  projectsEnabled: boolean;
}>`
  padding-top: ${({ projectsEnabled }) => (projectsEnabled ? '0px' : '50px')};
  padding-bottom: 50px;
  background: ${colors.grey200};
`;

interface Props {
  page: ICustomPageData;
}

interface InnerProps extends Props {
  statusCountsWithoutFilters: IStatusCounts;
}

const CustomPageProjectsAndEvents = ({
  page,
  statusCountsWithoutFilters,
}: InnerProps) => {
  const allStatusCountsWithoutFilters = getStatusCounts(
    statusCountsWithoutFilters
  );

  const [currentTab, setCurrentTab] = useState<PublicationTab>(
    getCurrentTab(allStatusCountsWithoutFilters)
  );

  // There will be either topic, area or space ids if this component renders.
  // To enable it, the page needs either a topic, area or space associated with it.
  const globalTopics = page.relationships.global_topics.data.map(
    (topic) => topic.id
  );
  const areaIds = page.relationships.areas.data.map((area) => area.id);
  const spaceIdList = page.relationships.spaces.data.map((space) => space.id);
  const spaceIds = spaceIdList.length > 0 ? spaceIdList : undefined;

  // When filtering by space we show folder cards in the space too (not just
  // projects), so we keep folder publications in the result set and restrict
  // to top-level publications to avoid duplicating folder children as
  // standalone project cards.
  const isSpaceFiltered = !!spaceIds;

  const {
    data,
    isInitialLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAdminPublications({
    pageSize: 6,
    globalTopics,
    areaIds,
    spaceIds,
    publicationStatusFilter: getPublicationStatuses(currentTab),
    rootLevelOnly: isSpaceFiltered,
    removeNotAllowedParents: true,
    onlyProjects: !isSpaceFiltered,
    remove_all_unlisted: true,
  });

  const adminPublications = data?.pages.map((page) => page.data).flat();

  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });

  const hideProjects =
    !advancedCustomPagesEnabled ||
    page.attributes.projects_filter_type === 'no_filter';

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (hideProjects || !statusCountsWithoutFilters) {
    return null;
  }

  return (
    <>
      {page.attributes.projects_enabled && (
        <ProjectCardsContentContainer mode="page">
          <ProjectAndFolderCardsInner
            statusCounts={allStatusCountsWithoutFilters}
            showTitle={false}
            showFilters={false}
            showSearch={false}
            adminPublications={adminPublications || []}
            statusCountsWithoutFilters={allStatusCountsWithoutFilters}
            layout="dynamic"
            loadingInitial={isInitialLoading}
            loadingMore={isFetchingNextPage}
            hasMore={hasNextPage}
            currentTab={currentTab}
            onLoadMore={fetchNextPage}
            onChangeCurrentTab={setCurrentTab}
          />
        </ProjectCardsContentContainer>
      )}
      {page.attributes.events_widget_enabled && (
        <EventsContentContainer
          mode="page"
          projectsEnabled={page.attributes.projects_enabled}
        >
          <EventsWidget staticPageId={page.id} />
        </EventsContentContainer>
      )}
    </>
  );
};

const CustomPageProjectsAndEventsWrapper = ({ page }: Props) => {
  // There will be either topic, area or space ids if this component renders.
  // To enable it, the page needs either a topic, area or space associated with it.
  const globalTopics = page.relationships.global_topics.data.map(
    (topic) => topic.id
  );
  const areaIds = page.relationships.areas.data.map((area) => area.id);
  const spaceIdList = page.relationships.spaces.data.map((space) => space.id);
  const spaceIds = spaceIdList.length > 0 ? spaceIdList : undefined;
  const isSpaceFiltered = !!spaceIds;

  const { data: statusCountsWithoutFilters } = useAdminPublicationsStatusCounts(
    {
      globalTopics,
      areaIds,
      spaceIds,
      publicationStatusFilter: PUBLICATION_STATUSES,
      rootLevelOnly: isSpaceFiltered,
      removeNotAllowedParents: true,
      onlyProjects: !isSpaceFiltered,
    }
  );

  if (!statusCountsWithoutFilters) return null;

  return (
    <CustomPageProjectsAndEvents
      page={page}
      statusCountsWithoutFilters={statusCountsWithoutFilters}
    />
  );
};

export default CustomPageProjectsAndEventsWrapper;
