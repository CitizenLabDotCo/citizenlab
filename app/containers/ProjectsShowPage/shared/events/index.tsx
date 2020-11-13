import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProject from 'hooks/useProject';
import useEvents from 'hooks/useEvents';

// components
import EventCard from './EventCard';
import ContentContainer from 'components/ContentContainer';
import {
  SectionContainer,
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// style
import styled from 'styled-components';

const Container = styled.div`
  background: #fff;
`;

interface Props {
  projectId: string;
  className?: string;
}

const EventsContainer = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });
  const events = useEvents(projectId);

  if (!isNilOrError(project) && !isNilOrError(events)) {
    const upcomingEvents = events.filter((event) => {
      const eventTime = pastPresentOrFuture([
        event.attributes.start_at,
        event.attributes.end_at,
      ]);
      return eventTime === 'present' || eventTime === 'future';
    });

    if (upcomingEvents && upcomingEvents.length > 0) {
      return (
        <Container id="project-events" className={className || ''}>
          <ContentContainer maxWidth={maxPageWidth}>
            <SectionContainer>
              <ProjectPageSectionTitle>
                <FormattedMessage {...messages.upcomingEvents} />
              </ProjectPageSectionTitle>
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </SectionContainer>
          </ContentContainer>
        </Container>
      );
    }
  }

  return null;
});

export default EventsContainer;
