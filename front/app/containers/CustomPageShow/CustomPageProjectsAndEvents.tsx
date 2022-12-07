import React from 'react';
import styled from 'styled-components';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';
import { isNilOrError } from 'utils/helperUtils';
import useAdminPublications from 'hooks/useAdminPublications';
import { ICustomPageData } from 'services/customPages';
import ContentContainer from 'components/ContentContainer';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { PublicationStatus } from 'services/projects';
import useAdminPublicationsStatusCounts from 'hooks/useAdminPublicationsStatusCounts';
import ProjectAndFolderCardsInner from 'components/ProjectAndFolderCards/ProjectAndFolderCardsInner';
import { colors } from 'utils/styleUtils';

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

  const adminPublications = useAdminPublications({
    topicIds,
    areaIds,
    publicationStatusFilter,
  });

  const paginatedAdminPublications = useAdminPublications({
    pageSize: 6,
    topicIds,
    areaIds,
    publicationStatusFilter,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

  const { counts: statusCountsWithoutFilters } =
    useAdminPublicationsStatusCounts({
      topicIds,
      areaIds,
      publicationStatusFilter,
      rootLevelOnly: true,
      removeNotAllowedParents: true,
    });

  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });

  const hideProjects =
    !advancedCustomPagesEnabled ||
    page.attributes.projects_filter_type === 'no_filter';

  if (hideProjects || isNilOrError(adminPublications.list)) {
    return null;
  }

  const projectIds = adminPublications.list.map(
    (adminPublication) => adminPublication.relationships.publication.data.id
  );

  return (
    <>
      {page.attributes.projects_enabled && (
        <ProjectCardsContentContainer>
          <ProjectAndFolderCardsInner
            statusCounts={statusCountsWithoutFilters}
            publicationStatusFilter={publicationStatusFilter}
            showTitle={true}
            showFilters={false}
            showSearch={false}
            adminPublications={paginatedAdminPublications}
            statusCountsWithoutFilters={statusCountsWithoutFilters}
            layout="dynamic"
          />
        </ProjectCardsContentContainer>
      )}
      {page.attributes.events_widget_enabled && (
        <EventsContentContainer
          projectsEnabled={page.attributes.projects_enabled}
        >
          <EventsWidget projectIds={projectIds} />
        </EventsContentContainer>
      )}
    </>
  );
};

export default CustomPageProjectsAndEvents;
