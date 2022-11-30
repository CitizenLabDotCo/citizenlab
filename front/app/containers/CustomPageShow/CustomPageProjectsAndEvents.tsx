import React from 'react';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';
import { isNilOrError } from 'utils/helperUtils';
import useAdminPublications from 'hooks/useAdminPublications';
import { ICustomPageData } from 'services/customPages';
import ProjectsList from './ProjectsList';
import ContentContainer from 'components/ContentContainer';

interface Props {
  page: ICustomPageData;
}

const CustomPageProjectsAndEvents = ({ page }: Props) => {
  // There will be either topic or area ids if this component renders.
  // To enable it, the page needs either a topic or area associated with it.
  const topicIds = page.relationships.topics.data.map((topic) => topic.id);
  const areaIds = page.relationships.areas.data.map((area) => area.id);

  const adminPublications = useAdminPublications({
    topicIds,
    areaIds,
    publicationStatusFilter: ['published', 'archived'],
  });
  if (isNilOrError(adminPublications.list)) {
    return null;
  }
  const projectIds = adminPublications.list.map(
    (adminPublication) => adminPublication.relationships.publication.data.id
  );

  return (
    <>
      {page.attributes.projects_enabled && (
        <ContentContainer>
          <ProjectsList adminPublications={adminPublications.list} />
        </ContentContainer>
      )}
      {page.attributes.events_widget_enabled && (
        <ContentContainer>
          <EventsWidget projectIds={projectIds} />
        </ContentContainer>
      )}
    </>
  );
};

export default CustomPageProjectsAndEvents;
