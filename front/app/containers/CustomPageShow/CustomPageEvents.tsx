import React from 'react';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';
import { isNilOrError } from 'utils/helperUtils';
import useAdminPublications from 'hooks/useAdminPublications';
import { ICustomPageData } from 'services/customPages';

interface Props {
  page: ICustomPageData;
}

const CustomPageEvents = ({ page }: Props) => {
  // There will be either topic or area ids if this component renders.
  // To enable it, the page needs either a topic or area associated with it.
  const topicIds = page.relationships.topics.data.map((topic) => topic.id);
  const areaIds = page.relationships.areas.data.map((area) => area.id);

  const adminPublications = useAdminPublications({
    topicFilter: topicIds,
    areaFilter: areaIds,
    publicationStatusFilter: ['published', 'archived'],
  });
  const projectIds = !isNilOrError(adminPublications.list)
    ? adminPublications.list.map(
        (adminPublication) => adminPublication.relationships.publication.data.id
      )
    : null;

  if (projectIds) {
    return <EventsWidget projectIds={projectIds} />;
  }

  return null;
};

export default CustomPageEvents;
