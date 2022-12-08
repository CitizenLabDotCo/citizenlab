import React from 'react';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';
import useAdminPublications from 'hooks/useAdminPublications';
import { ICustomPageData } from 'services/customPages';
import ContentContainer from 'components/ContentContainer';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { PublicationStatus } from 'services/projects';
import useAdminPublicationsStatusCounts from 'hooks/useAdminPublicationsStatusCounts';
import ProjectAndFolderCardsInner from 'components/ProjectAndFolderCards/ProjectAndFolderCardsInner';

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

  const adminPublications = useAdminPublications({
    pageSize: 6,
    topicIds,
    areaIds,
    publicationStatusFilter,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
    onlyProjects: true,
  });

  const { counts: statusCountsWithoutFilters } =
    useAdminPublicationsStatusCounts({
      topicIds,
      areaIds,
      publicationStatusFilter,
      rootLevelOnly: true,
      removeNotAllowedParents: true,
      onlyProjects: true,
    });

  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });

  const hideProjects =
    !advancedCustomPagesEnabled ||
    page.attributes.projects_filter_type === 'no_filter';

  if (hideProjects) {
    return null;
  }

  return (
    <>
      {page.attributes.projects_enabled && (
        <ContentContainer>
          <ProjectAndFolderCardsInner
            statusCounts={statusCountsWithoutFilters}
            publicationStatusFilter={publicationStatusFilter}
            showTitle={false}
            showFilters={false}
            showSearch={false}
            adminPublications={adminPublications}
            statusCountsWithoutFilters={statusCountsWithoutFilters}
            layout="dynamic"
          />
        </ContentContainer>
      )}
      {page.attributes.events_widget_enabled && (
        <ContentContainer>
          <EventsWidget staticPageId={page.id} />
        </ContentContainer>
      )}
    </>
  );
};

export default CustomPageProjectsAndEvents;
