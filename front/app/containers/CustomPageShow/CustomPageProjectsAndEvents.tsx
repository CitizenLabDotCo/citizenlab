import React from 'react';
import styled from 'styled-components';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { ICustomPageData } from 'api/custom_pages/types';
import ContentContainer from 'components/ContentContainer';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { PublicationStatus } from 'api/projects/types';
import useAdminPublicationsStatusCounts from 'api/admin_publications_status_counts/useAdminPublicationsStatusCounts';
import ProjectAndFolderCardsInner from 'components/ProjectAndFolderCards/ProjectAndFolderCardsInner';
import { colors } from '@citizenlab/cl2-component-library';
import getStatusCounts from 'api/admin_publications_status_counts/util/getAdminPublicationsStatusCount';

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

const CustomPageProjectsAndEvents = ({ page }: Props) => {
  // There will be either topic or area ids if this component renders.
  // To enable it, the page needs either a topic or area associated with it.
  const topicIds = page.relationships.topics.data.map((topic) => topic.id);
  const areaIds = page.relationships.areas.data.map((area) => area.id);
  const publicationStatusFilter: PublicationStatus[] = [
    'published',
    'archived',
  ];

  const {
    data,
    isInitialLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAdminPublications({
    pageSize: 6,
    topicIds,
    areaIds,
    publicationStatusFilter,
    rootLevelOnly: false,
    removeNotAllowedParents: true,
    onlyProjects: true,
  });

  const adminPublications = data?.pages.map((page) => page.data).flat();

  const { data: statusCountsWithoutFilters } = useAdminPublicationsStatusCounts(
    {
      topicIds,
      areaIds,
      publicationStatusFilter,
      rootLevelOnly: false,
      removeNotAllowedParents: true,
      onlyProjects: true,
    }
  );

  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });

  const hideProjects =
    !advancedCustomPagesEnabled ||
    page.attributes.projects_filter_type === 'no_filter';

  if (hideProjects || !statusCountsWithoutFilters) {
    return null;
  }

  return (
    <>
      {page.attributes.projects_enabled && (
        <ProjectCardsContentContainer mode="page">
          <ProjectAndFolderCardsInner
            statusCounts={getStatusCounts(statusCountsWithoutFilters)}
            publicationStatusFilter={publicationStatusFilter}
            showTitle={false}
            showFilters={false}
            showSearch={false}
            adminPublications={adminPublications || []}
            statusCountsWithoutFilters={getStatusCounts(
              statusCountsWithoutFilters
            )}
            layout="dynamic"
            loadingInitial={isInitialLoading}
            loadingMore={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            hasMore={hasNextPage}
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

export default CustomPageProjectsAndEvents;
